import { readdirSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';

import type { Node, ParsedPattern } from '../dist';
import {
	collapseDuplicatesTransformer,
	englishDataset,
	PatternMatcher,
	skipNonAlphabeticTransformer,
	SyntaxKind,
	toAsciiLowerCaseTransformer,
} from '../dist';
import { BenchmarkSuite } from './benchmark';
import { italic, parseRunCount } from './util';

const numRuns = parseRunCount();

const built = englishDataset.build();
const matcher = new PatternMatcher({
	...built,
	blacklistMatcherTransformers: [toAsciiLowerCaseTransformer(), skipNonAlphabeticTransformer()],
	whitelistMatcherTransformers: [
		toAsciiLowerCaseTransformer(),
		collapseDuplicatesTransformer({ defaultThreshold: Infinity, customThresholds: new Map([[' ', 1]]) }),
	],
});

const regExps = built.blacklistedPatterns.map((term) => patternToRegExp(term.pattern));
const whitelistedTerms = built.whitelistedTerms!;

const a = 'a'.charCodeAt(0);
const A = 'A'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);
const space = ' '.charCodeAt(0);

const tests: [title: string, text: string][] = [];
const inputDir = join(__dirname, 'inputs');
for (const filename of readdirSync(inputDir)) {
	const content = readFileSync(join(inputDir, filename), { encoding: 'utf8' });
	tests.push([basename(filename, extname(filename)), content.trim()]);
}

let matchCount = 0; // to guard against dead code elimination

for (const [title, text] of tests) {
	const suite = new BenchmarkSuite(title)
		.add('regular expressions and string methods', () => {
			const lowerCased = text.toLowerCase();

			const withoutDuplicateSpacesIndexMap: number[] = [];
			// Skip duplicate spaces while matching whitelisted terms.
			let withoutDuplicateSpaces = '';
			for (let i = 0; i < lowerCased.length; i++) {
				const c = lowerCased.charCodeAt(i);
				if (i === 0 || lowerCased.charCodeAt(i - 1) !== c || c !== space) {
					withoutDuplicateSpaces += lowerCased[i];
					withoutDuplicateSpacesIndexMap.push(i);
				}
			}

			const whitelistedRegions: [number, number][] = [];
			for (const whitelistedTerm of whitelistedTerms) {
				for (let i = 0; i < withoutDuplicateSpaces.length; i++) {
					if (withoutDuplicateSpaces.startsWith(whitelistedTerm, i)) {
						whitelistedRegions.push([
							withoutDuplicateSpacesIndexMap[i],
							withoutDuplicateSpacesIndexMap[i + whitelistedTerm.length - 1],
						]);
					}
				}
			}

			// Skip non-alphabetical characters while matching the blacklisted patterns.
			const onlyAlphabeticalCharsIndexMap: number[] = [];
			let onlyAlphabeticalChars = '';
			for (let i = 0; i < lowerCased.length; i++) {
				const c = lowerCased.charCodeAt(i);
				if ((a <= c && c <= z) || (A <= c && c <= Z)) {
					onlyAlphabeticalChars += lowerCased[i];
					onlyAlphabeticalCharsIndexMap.push(i);
				}
			}

			const matches = [];
			for (let i = 0; i < regExps.length; i++) {
				const regExp = regExps[i];
				let match: RegExpExecArray | null;
				while ((match = regExp.exec(onlyAlphabeticalChars))) {
					const startIndex = onlyAlphabeticalCharsIndexMap[match.index];
					const endIndex = onlyAlphabeticalCharsIndexMap[match.index + match[0].length - 1];
					if (whitelistedRegions.some((region) => startIndex >= region[0] && endIndex <= region[1])) continue;
					matches.push({ termId: i, matchLength: match[0].length, startIndex, endIndex });
					regExp.lastIndex = match.index + 1;
				}
			}

			matchCount += matches.length;
		})
		.add('Obscenity', () => {
			matchCount += matcher.getAllMatches(text).length;
		});

	suite.run(numRuns);
	console.log();
}

console.log(italic(`(Ignore, to guard against dead code elimination) ${matchCount}`));

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
