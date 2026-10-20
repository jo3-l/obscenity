// Compare compiled revisions without measuring construction or compilation.
// node scripts/benchmark-match-end.cjs main=/path/main/dist/index.js \
//   original=/path/original/dist/index.js revised=./dist/index.js
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const { performance } = require('node:perf_hooks');
const os = require('node:os');

function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)];
}

if (process.argv[2] === '--worker') {
	const lib = require(resolve(process.argv[3]));
	const english = new lib.RegExpMatcher({ ...lib.englishDataset.build(), ...lib.englishRecommendedTransformers });
	const focused = new lib.RegExpMatcher({
		blacklistedTerms: [{ id: 1, pattern: lib.parseRawPattern('pit') }],
		blacklistMatcherTransformers: [lib.collapseDuplicatesTransformer()],
	});
	const cases = [
		['english/short-clean', english, 'The next round starts soon. Please choose a word and join the game.'],
		['english/short-repeats', english, 'what the fuckkkk!!! ok, next round'],
		['english/long-clean', english, 'The next round starts soon. Please choose a word and join the game. '.repeat(64)],
		['english/unicode', english, '🌉 what the fuuuckkkk! 🐈 next round, café ＦＵＣＫ!'],
		['focused/repeats', focused, 'pppiiittt '.repeat(32)],
	];
	let sink = 0;
	const results = [];
	for (const [name, matcher, input] of cases) {
		// All revisions must agree on detection, IDs, starts, and transformed lengths.
		const matches = matcher.getAllMatches(input);
		assert.equal(matcher.hasMatch(input), matches.length > 0);
		const signature = matches.map(({ termId, startIndex, matchLength }) => ({ termId, startIndex, matchLength }));
		for (const method of ['getAllMatches', 'hasMatch']) {
			const run = (iterations) => {
				const start = performance.now();
				for (let i = 0; i < iterations; i++) {
					const result = matcher[method](input);
					sink += method === 'getAllMatches' ? result.length : Number(result);
				}
				return performance.now() - start;
			};
			const warmupStart = performance.now();
			while (performance.now() - warmupStart < 300) run(256);
			let iterations = 32;
			while (run(iterations) < 100) iterations *= 2;
			const samples = [];
			for (let sample = 0; sample < 7; sample++) {
				global.gc();
				samples.push((run(iterations) * 1000) / iterations);
			}
			results.push({ name: `${name}/${method}`, samplesUs: samples, signature });
		}
	}
	// Count retained mapping entries directly; this is not a heap/RSS estimate.
	const input = 'pppiiittt '.repeat(32);
	const transformed = focused.applyTransformers(input, focused.blacklistMatcherTransformers);
	const mappingEntries = transformed.filter(Array.isArray).reduce((sum, array) => sum + array.length, 0);
	process.stdout.write(JSON.stringify({ results, mappingEntries, sink }));
} else {
	const variants = process.argv.slice(2).map((arg) => {
		const separator = arg.indexOf('=');
		assert(separator > 0, 'Expected label=/path/to/dist/index.js');
		return { label: arg.slice(0, separator), path: resolve(arg.slice(separator + 1)), runs: [] };
	});
	assert(variants.length >= 2, 'Provide at least two compiled revisions');
	for (let round = 0; round < 3; round++) {
		for (let offset = 0; offset < variants.length; offset++) {
			const variant = variants[(round + offset) % variants.length];
			process.stderr.write(`Round ${round + 1}: ${variant.label}\n`);
			const child = spawnSync(process.execPath, ['--expose-gc', __filename, '--worker', variant.path], {
				encoding: 'utf8',
			});
			assert.equal(child.status, 0, child.stderr);
			variant.runs.push(JSON.parse(child.stdout));
		}
	}
	const reference = variants[0].runs[0].results;
	for (const variant of variants) {
		for (const run of variant.runs) {
			assert.deepEqual(
				run.results.map((r) => r.signature),
				reference.map((r) => r.signature),
			);
		}
	}
	const results = reference.map((item, i) => ({
		name: item.name,
		microsecondsPerCall: Object.fromEntries(
			variants.map((variant) => [variant.label, median(variant.runs.flatMap((run) => run.results[i].samplesUs))]),
		),
		processMediansUs: Object.fromEntries(
			variants.map((variant) => [variant.label, variant.runs.map((run) => median(run.results[i].samplesUs))]),
		),
	}));
	process.stdout.write(
		`${JSON.stringify(
			{
				node: process.version,
				platform: `${os.platform()} ${os.arch()}`,
				cpu: os.cpus()[0].model,
				methodology:
					'Median of 21 samples across 3 fresh processes per revision; rotated revision order; 300ms warmup per case/method before adaptive batch calibration to at least 100ms; 7 timed samples per case/process; GC outside timing; matcher construction excluded.',
				mappingEntries: Object.fromEntries(variants.map((v) => [v.label, v.runs[0].mappingEntries])),
				results,
			},
			null,
			2,
		)}\n`,
	);
}
