import { assignIncrementingIds } from '../../../src/matcher/BlacklistedTerm';
import type { MatchPayload } from '../../../src/matcher/MatchPayload';
import { RegExpMatcher } from '../../../src/matcher/regexp/RegExpMatcher';
import { parseRawPattern, pattern } from '../../../src/pattern/Pattern';
import { englishDataset, englishRecommendedTransformers } from '../../../src/preset/english';
import { createSimpleTransformer } from '../../../src/transformer/Transformers';
import { skipNonAlphabeticTransformer } from '../../../src/transformer/skip-non-alphabetic';
import { CharacterCode } from '../../../src/util/Char';

describe('constructor', () => {
	it('should not accept duplicate term IDs', () => {
		expect(
			() =>
				new RegExpMatcher({
					blacklistedTerms: [
						{ id: 0, pattern: pattern`hi` },
						{ id: 1, pattern: pattern`bye` },
						{ id: 1, pattern: pattern`yo` },
					],
				}),
		).toThrow('Duplicate blacklisted term');
	});

	it('should not accept empty patterns', () => {
		expect(
			() =>
				new RegExpMatcher({
					blacklistedTerms: [{ id: 10, pattern: pattern`` }],
				}),
		).toThrow('potentially matches empty string');
	});

	it('should not accept patterns with optionals that have the empty string in their match set', () => {
		expect(
			() =>
				new RegExpMatcher({
					blacklistedTerms: [{ id: 10, pattern: pattern`[abc]` }],
				}),
		).toThrow('potentially matches empty string');
	});
});

describe('matching', () => {
	it.each([
		['should be case sensitive (no match)', ['WORLD'], 'hello world', []],
		['should be case sensitive (with match)', ['yO'], 'hello yO yo', { 0: [[6, 7, 2]] }],
		[
			'should support surrogate pairs',
			['cool 🌉'],
			'cool cool cool cool 🌉',
			{
				0: [[15, 21, 6]],
			},
		],
		['should only match on the term exactly', ['her'], 'h he! her', { 0: [[6, 8, 3]] }],
		['should work with terms that normalize to a different string', ['豈'], '豈', { 0: [[0, 0, 1]] }],
		['should work with the null character', ['\u0000'], '\u0000', { 0: [[0, 0, 1]] }],
		[
			'issue #71: correct match indices with codepoints encoded as multiple UTF-16 code units',
			['ass'],
			'🤣ass',
			{ 0: [[2, 4, 3]] },
		],
	])('%s', (_, patterns, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [idStr, matchData] of Object.entries(matches)) {
			const id = Number(idStr);
			for (const match of matchData) {
				expected.push({
					termId: id,
					startIndex: match[0],
					endIndex: match[1],
					matchLength: match[2],
				});
			}
		}

		const matcher = new RegExpMatcher({ blacklistedTerms: assignIncrementingIds(patterns.map(parseRawPattern)) });
		expect(matcher.getAllMatches(input)).toBePermutationOf(expected);
	});
});

describe('matching with whitelisted terms', () => {
	it('should not match parts of the text which are completely matched by a whitelisted term', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`penis` }],
			blacklistMatcherTransformers: [skipNonAlphabeticTransformer()],
			whitelistedTerms: ['pen is'],
		});
		expect(matcher.getAllMatches('the pen is mightier than the penis')).toStrictEqual([
			{
				termId: 1,
				startIndex: 29,
				endIndex: 33,
				matchLength: 5,
			},
		]);
	});

	it('should match parts of the text that only overlap (and are not completely contained) by a whitelisted term', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`bitch` }],
			whitelistedTerms: ['bit', 'itch'],
		});
		expect(matcher.getAllMatches('a bitch')).toStrictEqual([
			{
				termId: 1,
				startIndex: 2,
				endIndex: 6,
				matchLength: 5,
			},
		]);
	});

	it('does not accept empty whitelist patterns', () => {
		expect(() => new RegExpMatcher({ blacklistedTerms: [], whitelistedTerms: [''] })).toThrow('empty string');
	});

	it('issue #49', () => {
		const input = `    "" ""
    "" ""
    "" ""
Assamese -> Assam`;

		const matcher = new RegExpMatcher({
			...englishDataset.build(),
			...englishRecommendedTransformers,
		});
		expect(matcher.getAllMatches(input)).toHaveLength(0);
	});
});

describe('matching with blacklist transformers', () => {
	it('should skip characters which became undefined after transformation', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`something` }],
			blacklistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.getAllMatches('s o m e t h i n  g')).toStrictEqual([
			{
				termId: 1,
				startIndex: 0,
				endIndex: 17,
				matchLength: 9,
			},
		]);
	});

	it('should work with transformers that change chars (no match)', () => {
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`sa?e` }],
			blacklistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('same')).toHaveLength(0);
	});

	it('should work with transformers that change chars (with match)', () => {
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`hbllo?` }],
			blacklistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('sup hallothere')).toStrictEqual([
			{
				termId: 1,
				startIndex: 4,
				endIndex: 9,
				matchLength: 6,
			},
		]);
	});

	it('should not affect matching of whitelisted terms', () => {
		const ignoreAllAs = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`bbb` }],
			whitelistedTerms: ['aabbbaa'],
			blacklistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.getAllMatches('!!!! $$aabbbaa## !!!')).toHaveLength(0);
	});
});

describe('matching with whitelist transformers', () => {
	it('should work with transformers which become undefined after transformation', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`world` }],
			whitelistedTerms: ['helloworld!'],
			whitelistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.getAllMatches('h e l l o world!')).toHaveLength(0);
	});

	it('should work with transformers that change chars (no match)', () => {
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`biash` }],
			whitelistedTerms: ['a biash'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('the a biash was')).toStrictEqual([
			{ termId: 1, startIndex: 6, endIndex: 10, matchLength: 5 },
		]);
	});

	it('should work with transformers that change chars (with match)', () => {
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`ass` }],
			whitelistedTerms: ['bss'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('a big ass')).toHaveLength(0);
	});

	it('should not affect matching of blacklisted terms', () => {
		const ignoreAllAs = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`dader` }],
			whitelistedTerms: ['a dader'],
			whitelistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.getAllMatches('there is a dader')).toStrictEqual([
			{ termId: 1, startIndex: 11, endIndex: 15, matchLength: 5 },
		]);
	});
});

describe('RegExpMatcher#hasMatch()', () => {
	it('should return true if there is a match', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 0, pattern: pattern`?hi?` }],
		});
		expect(matcher.hasMatch('my hie')).toBeTruthy();
	});

	it('should return false if there is no match', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 0, pattern: pattern`|no` }],
		});
		expect(matcher.hasMatch('yno')).toBeFalsy();
	});

	it('should return false if there is a match but it is whitelisted', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 0, pattern: pattern`🌉` }],
			whitelistedTerms: ['🌉'],
		});
		expect(matcher.hasMatch('yo 🌉')).toBeFalsy();
	});
});

describe('RegExpMatcher#getAllMatches()', () => {
	it('should sort the matches if the sorted parameter is true', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [
				{ id: 0, pattern: pattern`fuck` },
				{ id: 1, pattern: pattern`bitch` },
			],
		});
		expect(matcher.getAllMatches('bitch fuck', true)).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 4, matchLength: 5 },
			{ termId: 0, startIndex: 6, endIndex: 9, matchLength: 4 },
		]);
	});
});
