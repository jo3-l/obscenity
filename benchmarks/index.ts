import { readdirSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import type { RecordableHistogram } from 'perf_hooks';
import { createHistogram, performance } from 'perf_hooks';

import type { Node, ParsedPattern } from '../dist';
import { englishDataset, PatternMatcher, SyntaxKind, toAsciiLowerCaseTransformer } from '../dist';

let matchCount = 0; // to guard against dead code elimination

const built = englishDataset.build();
const matcher = new PatternMatcher({
	...built,
	blacklistMatcherTransformers: [toAsciiLowerCaseTransformer()],
	whitelistMatcherTransformers: [toAsciiLowerCaseTransformer()],
});

function getPatternMatcherBenchmarkCase(text: string): [() => void, RecordableHistogram] {
	const histogram = createHistogram();
	return [
		performance.timerify(
			() => {
				matchCount += matcher.setInput(text).getAllMatches().length;
			},
			{ histogram },
		),
		histogram,
	];
}

const regExps = built.blacklistedPatterns.map((term) => patternToRegExp(term.pattern));
const whitelistedTerms = built.whitelistedTerms!;

function getRegExpBenchmarkCase(text: string): [() => void, RecordableHistogram] {
	const histogram = createHistogram();
	return [
		performance.timerify(
			() => {
				const lowercased = text.toLowerCase();

				const whitelistedRegions = [];
				for (const whitelistedTerm of whitelistedTerms) {
					let i = 0;
					for (
						let startIndex = lowercased.indexOf(whitelistedTerm, i);
						startIndex !== -1;
						startIndex = lowercased.indexOf(whitelistedTerm, i)
					) {
						const endIndex = startIndex + whitelistedTerm.length - 1;
						whitelistedRegions.push([startIndex, endIndex]);
						i = endIndex + 1;
					}
				}

				const matches = [];
				for (let i = 0; i < regExps.length; i++) {
					const regExp = regExps[i];
					for (const match of lowercased.matchAll(regExp)) {
						const startIndex = match.index!;
						// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
						const endIndex = startIndex + match[0].length - 1;
						if (whitelistedRegions.some((region) => startIndex >= region[0] && endIndex <= region[1])) continue;
						matches.push({ termId: i, matchLength: match[0].length, startIndex, endIndex });
					}
				}

				matchCount += matches.length;
			},
			{ histogram },
		),
		histogram,
	];
}

const green = makeColorizer(32);
const yellow = makeColorizer(33);
const italic = makeColorizer(3);
const bold = makeColorizer(1);

const cases = [];
for (const filename of readdirSync(join(__dirname, 'cases'))) {
	const content = readFileSync(join(__dirname, 'cases', filename), { encoding: 'utf8' });
	cases.push([basename(filename), content.trim()]);
}

for (const [name, text] of cases) {
	const [runPatternMatcher, patternMatcherHistogram] = getPatternMatcherBenchmarkCase(text);
	const [runRegExpMatcher, regExpMatcherHistogram] = getRegExpBenchmarkCase(text);

	console.log(`🏁 Running case ${green(name)}:\n`);

	for (let n = 0; n < 1e3; n++) runPatternMatcher();
	for (let n = 0; n < 1e3; n++) runRegExpMatcher();

	console.log(`Results for case ${green(name)}:\n`);
	console.log(`Using ${bold('Obscenity')}: ${yellow(patternMatcherHistogram.mean.toString())}`);
	console.log(`Using ${bold('regular expressions and indexOf')}: ${yellow(regExpMatcherHistogram.mean.toString())}`);
	console.log(italic(`(Ignore, to guard against dead code elimination) ${matchCount}\n`));
}

function patternToRegExp(pattern: ParsedPattern) {
	let regExpStr = '';
	if (pattern.requireWordBoundaryAtStart) regExpStr += '\\b';
	regExpStr += pattern.nodes.map(nodeToRegExp).join('');
	if (pattern.requireWordBoundaryAtEnd) regExpStr += '\\b';
	return new RegExp(regExpStr, 'gs');
}

/** @returns {string} */
function nodeToRegExp(node: Node): string {
	switch (node.kind) {
		case SyntaxKind.Literal:
			return escapeRegExp(String.fromCodePoint(...node.chars));
		case SyntaxKind.Optional:
			return `(?:${nodeToRegExp(node.childNode)})?`;
		case SyntaxKind.Wildcard:
			return '.';
	}
}

function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeColorizer(code: number) {
	return (text: string) => `\x1b[${code}m${text}\x1b[0m`;
}
