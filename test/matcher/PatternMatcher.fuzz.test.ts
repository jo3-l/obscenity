import * as fc from 'fast-check';

import { assignIncrementingIds } from '../../src/matcher/BlacklistedTerm';
import type { Interval } from '../../src/matcher/interval/Interval';
import { compareIntervals } from '../../src/matcher/interval/Interval';
import { PatternMatcher } from '../../src/matcher/PatternMatcher';
import type { LiteralNode, ParsedPattern } from '../../src/pattern/Nodes';
import { SyntaxKind } from '../../src/pattern/Nodes';
import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

test('running the pattern matcher on a set of patterns and input should have the same result as using a naive approach with regexp', () => {
	fc.assert(
		fc.property(
			fc.stringOf(fc.char()).chain((input) => {
				const substringPatterns =
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
										.map(([pat, wildcardIndices]) => {
											let newPat = '';
											for (let i = 0; i < pat.length; i++) {
												if (wildcardIndices.includes(i)) newPat += '?';
												else newPat += pat[i];
											}
											return newPat;
										}),
									fc.boolean(),
									fc.boolean(),
								),
						  );
				return fc.tuple(
					fc.constant(input),
					fc.array(
						fc.tuple(
							fc
								.stringOf(fc.oneof(fc.char16bits(), fc.char16bits(), fc.char16bits(), fc.constant('?')))
								.filter((p) => p.length > 0),
							fc.boolean(),
							fc.boolean(),
						),
					),
					substringPatterns,
				);
			}),
			([input, randPatterns, substrPatterns]) => {
				const seen = new Set<string>();
				const allPatterns: [string, boolean, boolean][] = [];
				for (const p of randPatterns) {
					if (!seen.has(p[0])) {
						allPatterns.push(p);
						seen.add(p[0]);
					}
				}
				for (const p of substrPatterns) {
					if (!seen.has(p[0])) {
						allPatterns.push(p);
						seen.add(p[0]);
					}
				}

				const matcher = new PatternMatcher({
					forkedTraversalLimit: Infinity,
					blacklistedPatterns: assignIncrementingIds(allPatterns.map(([p, a, b]) => toPattern(p, a, b))),
				});

				const ms = matcher.setInput(input).getAllMatches();
				const ps: Record<number, Interval[]> = {};
				for (const x of ms) {
					(ps[x.termId] ??= []).push([x.startIndex, x.endIndex]);
				}
				for (const v of Object.values(ps)) v.sort(compareIntervals);
				expect(ps).toStrictEqual(
					naiveMatch(
						allPatterns.map(([p, a, b]) => toRegExp(p, a, b)),
						input,
					),
				);
			},
		),
	);
});

function naiveMatch(regexps: RegExp[], input: string) {
	const result: Record<number, Interval[]> = {};
	for (let i = 0; i < regexps.length; i++) {
		const regexp = regexps[i];
		let match: RegExpMatchArray | null;
		while ((match = regexp.exec(input))) {
			(result[i] ??= []).push([match.index!, match.index! + match[0].length - 1]);
			regexp.lastIndex = match.index! + 1;
		}
	}

	for (const v of Object.values(result)) v.sort(compareIntervals);
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

function toPattern(pattern: string, requireWordBoundaryAtStart: boolean, requireWordBoundaryAtEnd: boolean) {
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
