import { readdirSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';

import type { Node, ParsedPattern } from '../dist';
import {
	englishDataset,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedTransformers,
	englishRecommendedWhitelistMatcherTransformers,
	PatternMatcher,
	SyntaxKind,
} from '../dist';
import { TransformerSet } from '../dist/transformer/TransformerSet';
import { BenchmarkSuite } from './benchmark';
import { italic, parseNumRuns } from './util';

const numRuns = parseNumRuns();

let n = 0; // to guard against dead code elimination

const inputs: [title: string, text: string][] = [];
const inputDir = join(__dirname, 'inputs');
for (const filename of readdirSync(inputDir)) {
	const content = readFileSync(join(inputDir, filename), { encoding: 'utf8' });
	inputs.push([basename(filename, extname(filename)), content.trim()]);
}

const built = englishDataset.build();
const matcher = new PatternMatcher({
	...built,
	...englishRecommendedTransformers,
});

const regExps = built.blacklistedTerms.map((term) => patternToRegExp(term.pattern));
const whitelistedTerms = built.whitelistedTerms!;

const whitelistMatcherTransformers = new TransformerSet(englishRecommendedWhitelistMatcherTransformers);
const blacklistMatcherTransformers = new TransformerSet(englishRecommendedBlacklistMatcherTransformers);

for (const [title, text] of inputs) {
	const suite = new BenchmarkSuite(title)
		.add('Obscenity', () => {
			n += matcher.getAllMatches(text).length;
			n += matcher.getAllMatches(text).length;
		})
		.add('regular expressions and string methods', () => {
			n += runBruteForceMatcher(text).length;
			n += runBruteForceMatcher(text).length;
		});

	suite.run(numRuns);
	console.log();
}

console.log(italic(`(Ignore, to guard against dead code elimination) ${n}`));

function runBruteForceMatcher(text: string) {
	const indices: number[] = [];
	let transformed = '';
	let index = 0;
	for (const char of text) {
		const result = blacklistMatcherTransformers.applyTo(char.codePointAt(0)!);
		if (result !== undefined) {
			indices.push(index);
			transformed += String.fromCodePoint(result);
		}
		index += char.length;
	}
	blacklistMatcherTransformers.resetAll();

	const whitelistedIntervals = getWhitelistedIntervals(text);

	const matches = [];
	for (let i = 0; i < regExps.length; i++) {
		const regExp = regExps[i];
		let match: RegExpExecArray | null;
		while ((match = regExp.exec(transformed))) {
			const startIndex = indices[match.index];
			const endIndex = indices[match.index + match[0].length - 1];
			if (whitelistedIntervals.some((region) => startIndex >= region[0] && endIndex <= region[1])) continue;
			matches.push({ termId: i, matchLength: match[0].length, startIndex, endIndex });
		}
	}

	return matches;
}

function getWhitelistedIntervals(text: string) {
	const indices: number[] = [];
	let transformed = '';
	let index = 0;
	for (const char of text) {
		const result = whitelistMatcherTransformers.applyTo(char.codePointAt(0)!);
		if (result !== undefined) {
			indices.push(index);
			transformed += String.fromCodePoint(result);
		}
		index += char.length;
	}
	whitelistMatcherTransformers.resetAll();

	const result: [number, number][] = [];
	for (const whitelistedTerm of whitelistedTerms) {
		for (
			let start = 0, idx = transformed.indexOf(whitelistedTerm, start);
			idx !== -1;
			start = idx + 1, idx = transformed.indexOf(whitelistedTerm, start)
		) {
			result.push([indices[start], indices[start + whitelistedTerm.length - 1]]);
		}
	}
	return result;
}

function patternToRegExp(pattern: ParsedPattern) {
	let regExpStr = '';
	// Note: \b doesn't have the *exact* same meaning as word boundary assertions in Obscenity,
	// but a completely fair comparison would use lookarounds/lookbehinds which would probably
	// kill the performance of the regexp.
	if (pattern.requireWordBoundaryAtStart) regExpStr += '\\b';
	regExpStr += pattern.nodes.map(nodeToRegExp).join('');
	if (pattern.requireWordBoundaryAtEnd) regExpStr += '\\b';
	return new RegExp(regExpStr, 'gs');
}

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
