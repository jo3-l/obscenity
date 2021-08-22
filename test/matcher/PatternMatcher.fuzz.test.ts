import * as fc from 'fast-check';

import { assignIncrementingIds } from '../../src/matcher/BlacklistedTerm';
import type { Interval } from '../../src/matcher/interval/Interval';
import { compareIntervals } from '../../src/matcher/interval/Interval';
import { PatternMatcher } from '../../src/matcher/PatternMatcher';
import type { LiteralNode, ParsedPattern } from '../../src/pattern/Nodes';
import { SyntaxKind } from '../../src/pattern/Nodes';
import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

test('running the pattern matcher on a set of patterns and input should have the same result as using a brute force approach with regexp', () => {
	fc.assert(
		fc.property(
			fc.stringOf(fc.char()).chain((input) => {
				// Generate patterns that are a substring of the input.
				const arbitrarySubstringPatterns =
					input.length < 2
						? fc.constant([])
						: fc.array(
								fc.tuple(
									fc
										.tuple(fc.integer(0, input.length - 1), fc.integer(0, input.length - 1))
										.filter(([a, b]) => a !== b)
										.chain(([a, b]) => {
											if (a > b) [a, b] = [b, a];
											return fc.tuple(fc.constant(input.slice(a, b)), fc.set(fc.integer(a, b)));
										})
										.map(([pattern, wildcardIndices]) => {
											let patternWithWildcards = '';
											for (let i = 0; i < pattern.length; i++) {
												if (wildcardIndices.includes(i)) patternWithWildcards += '?';
												else patternWithWildcards += pattern[i];
											}
											return patternWithWildcards;
										}),
									fc.boolean(),
									fc.boolean(),
								),
						  );
				// Completely random patterns.
				const completelyArbitraryPatterns = fc.array(
					fc.tuple(
						fc
							.stringOf(fc.oneof(fc.char16bits(), fc.char16bits(), fc.char16bits(), fc.constant('?')))
							.filter((p) => p.length > 0),
						fc.boolean(),
						fc.boolean(),
					),
				);
				return fc.tuple(fc.constant(input), completelyArbitraryPatterns, arbitrarySubstringPatterns);
			}),
			([input, randomPatterns, substrPatterns]) => {
				const seen = new Set<string>();
				const allPatterns: [string, boolean, boolean][] = [];
				for (const pattern of randomPatterns) {
					// Make sure we don't use the same pattern twice.
					if (!seen.has(pattern[0])) {
						allPatterns.push(pattern);
						seen.add(pattern[0]);
					}
				}
				for (const pattern of substrPatterns) {
					// Similar.
					if (!seen.has(pattern[0])) {
						allPatterns.push(pattern);
						seen.add(pattern[0]);
					}
				}

				const matcher = new PatternMatcher({
					blacklistedPatterns: assignIncrementingIds(
						allPatterns.map(([pattern, requireWordBoundaryAtStart, requireWordBoundaryAtEnd]) =>
							toNodes(pattern, requireWordBoundaryAtStart, requireWordBoundaryAtEnd),
						),
					),
				});

				const matchedRegions = matcher.setInput(input).getAllMatches();
				const transformedMatches: Record<number, Interval[]> = {};
				for (const payload of matchedRegions) {
					(transformedMatches[payload.termId] ??= []).push([payload.startIndex, payload.endIndex]);
				}

				for (const matches of Object.values(transformedMatches)) matches.sort(compareIntervals);
				expect(transformedMatches).toStrictEqual(
					bruteForceMatch(
						allPatterns.map(([pattern, requireWordBoundaryAtStart, requireWordBoundaryAtEnd]) =>
							toRegExp(pattern, requireWordBoundaryAtStart, requireWordBoundaryAtEnd),
						),
						input,
					),
				);
			},
		),
	);
});

function bruteForceMatch(regExps: RegExp[], input: string) {
	const result: Record<number, Interval[]> = {};
	for (let i = 0; i < regExps.length; i++) {
		const regExp = regExps[i];
		let match: RegExpExecArray | null;
		while ((match = regExp.exec(input))) {
			(result[i] ??= []).push([match.index, match.index + match[0].length - 1]);
			regExp.lastIndex = match.index + 1;
		}
	}

	for (const matches of Object.values(result)) matches.sort(compareIntervals);
	return result;
}

const regExpSpecialChars = ['.', '*', '+', '^', '$', '{', '}', '(', ')', '|', '[', '\\', ']'];

function toRegExp(pattern: string, requireWordBoundaryAtStart: boolean, requireWordBoundaryAtEnd: boolean) {
	let regexpStr = '';
	if (requireWordBoundaryAtStart) regexpStr += '(?<=[^\\dA-Za-z]|^)';
	for (const char of pattern) {
		if (regExpSpecialChars.includes(char)) regexpStr += `\\${char}`;
		else if (char === '?') regexpStr += '.';
		else regexpStr += char;
	}
	if (requireWordBoundaryAtEnd) regexpStr += '(?=[^\\dA-Za-z]|$)';
	return new RegExp(regexpStr, 'gs');
}

function toNodes(pattern: string, requireWordBoundaryAtStart: boolean, requireWordBoundaryAtEnd: boolean) {
	const parsed: ParsedPattern = { nodes: [], requireWordBoundaryAtStart, requireWordBoundaryAtEnd };
	for (const char of new CharacterIterator(pattern)) {
		if (char === CharacterCode.QuestionMark) {
			parsed.nodes.push({ kind: SyntaxKind.Wildcard });
		} else if (parsed.nodes.length === 0 || parsed.nodes[parsed.nodes.length - 1].kind !== SyntaxKind.Literal) {
			parsed.nodes.push({ kind: SyntaxKind.Literal, chars: [char] });
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(parsed.nodes[parsed.nodes.length - 1] as LiteralNode).chars.push(char);
		}
	}

	return parsed;
}
