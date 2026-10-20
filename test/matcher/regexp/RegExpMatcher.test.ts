import { fixedPhraseCensorStrategy } from '../../../src/censor/BuiltinStrategies';
import { TextCensor } from '../../../src/censor/TextCensor';
import { assignIncrementingIds } from '../../../src/matcher/BlacklistedTerm';
import type { MatchPayload } from '../../../src/matcher/MatchPayload';
import { RegExpMatcher } from '../../../src/matcher/regexp/RegExpMatcher';
import { parseRawPattern, pattern } from '../../../src/pattern/Pattern';
import { englishDataset, englishRecommendedTransformers } from '../../../src/preset/english';
import { collapseDuplicatesTransformer } from '../../../src/transformer/collapse-duplicates';
import { skipNonAlphabeticTransformer } from '../../../src/transformer/skip-non-alphabetic';
import { createSimpleTransformer } from '../../../src/transformer/Transformers';
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

describe('matching with transformers that collapse duplicates', () => {
	const collapsing = (...extraTransformers: ReturnType<typeof skipNonAlphabeticTransformer>[]) =>
		new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`pit` }],
			blacklistMatcherTransformers: [...extraTransformers, collapseDuplicatesTransformer({ defaultThreshold: 1 })],
		});

	it('should include collapsed duplicates of the last character in the match (issue #77)', () => {
		expect(collapsing().getAllMatches('pppiiittt')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 8, matchLength: 3 },
		]);
	});

	it('should end the match at the last collapsed duplicate', () => {
		expect(collapsing().getAllMatches('a pittt b')).toStrictEqual([
			{ termId: 1, startIndex: 2, endIndex: 6, matchLength: 3 },
		]);
	});

	it('should include skipped characters up to the next retained character', () => {
		expect(collapsing(skipNonAlphabeticTransformer()).getAllMatches('pittt!!! b')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 8, matchLength: 3 },
		]);
	});

	it('should include skipped characters at the end of the input', () => {
		expect(collapsing(skipNonAlphabeticTransformer()).getAllMatches('pittt!!!')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 7, matchLength: 3 },
		]);
	});

	it('should preserve punctuation and spaces when the transformers retain them', () => {
		expect(collapsing().getAllMatches('pittt!!! b')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 4, matchLength: 3 },
		]);
	});

	it('should respect custom thresholds and keep adjacent matches separate', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`pitt` }],
			blacklistMatcherTransformers: [collapseDuplicatesTransformer({ customThresholds: new Map([['t', 2]]) })],
		});
		expect(matcher.getAllMatches('pittttpittt')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 5, matchLength: 4 },
			{ termId: 1, startIndex: 6, endIndex: 10, matchLength: 4 },
		]);
	});

	it('should reset transformers between calls, including empty and entirely skipped inputs', () => {
		const matcher = collapsing(skipNonAlphabeticTransformer());
		for (const input of ['pittt', '', '!!!', 'pittt']) {
			expect(matcher.hasMatch(input)).toBe(input === 'pittt');
			expect(matcher.getAllMatches(input)).toStrictEqual(
				input === 'pittt' ? [{ termId: 1, startIndex: 0, endIndex: 4, matchLength: 3 }] : [],
			);
		}
	});

	it('should include collapsed duplicates that are separated by skipped characters', () => {
		expect(collapsing(skipNonAlphabeticTransformer()).getAllMatches('p i t t t')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 8, matchLength: 3 },
		]);
	});

	it('should include both halves of a collapsed surrogate pair', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`x🌉` }],
			blacklistMatcherTransformers: [collapseDuplicatesTransformer({ defaultThreshold: 1 })],
		});
		expect(matcher.getAllMatches('x🌉🌉 y')).toStrictEqual([{ termId: 1, startIndex: 0, endIndex: 4, matchLength: 2 }]);
	});

	it('should not change which matches are whitelisted', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`pit` }],
			whitelistedTerms: ['spit'],
			blacklistMatcherTransformers: [collapseDuplicatesTransformer({ defaultThreshold: 1 })],
		});
		expect(matcher.hasMatch('spittt')).toBe(false);
		expect(matcher.getAllMatches('spittt')).toStrictEqual([]);
	});

	it('should keep a whitelist effective when the reported span would include skipped punctuation', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`pit` }],
			whitelistedTerms: ['spit'],
			blacklistMatcherTransformers: [skipNonAlphabeticTransformer(), collapseDuplicatesTransformer()],
		});
		expect(matcher.hasMatch('spittt!!!')).toBe(false);
		expect(matcher.getAllMatches('spittt!!!')).toStrictEqual([]);
	});

	it('should censor the full repeated suffix with the English preset', () => {
		const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
		const censor = new TextCensor().setStrategy(fixedPhraseCensorStrategy('[censored]'));
		const input = 'what the fuckkkk!!! ok';
		expect(censor.applyTo(input, matcher.getAllMatches(input))).toBe('what the [censored]!!! ok');
	});
});

describe('reported match boundaries with UTF-16 transformations', () => {
	it.each([
		['x🌉', 'x🌉🌉 y', 4, 2],
		['x🌉', 'x🌉🌉', 4, 2],
		['x?', 'x🌉🌉 y', 4, 2],
		['x?', 'x🌉🌉', 4, 2],
		['x?', 'x\ud83c', 1, 2],
	])('should cover the whole source character for %s in %s', (term, input, endIndex, matchLength) => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: parseRawPattern(term) }],
			blacklistMatcherTransformers: [collapseDuplicatesTransformer()],
		});
		expect(matcher.getAllMatches(input)).toStrictEqual([{ termId: 1, startIndex: 0, endIndex, matchLength }]);
	});

	it.each([
		['x🌉🌉 y', 0x1f309, 97, 4],
		['xaa y', 97, 0x1f309, 2],
	])('should support transformations that change UTF-16 width in %s', (input, from, to, endIndex) => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`x?` }],
			blacklistMatcherTransformers: [
				createSimpleTransformer((c) => (c === from ? to : c)),
				collapseDuplicatesTransformer(),
			],
		});
		expect(matcher.getAllMatches(input)).toStrictEqual([{ termId: 1, startIndex: 0, endIndex, matchLength: 2 }]);
	});

	it('should include dropped characters even without a duplicate-collapsing transformer', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`pit` }],
			blacklistMatcherTransformers: [skipNonAlphabeticTransformer()],
		});
		expect(matcher.getAllMatches('pit!!! b')).toStrictEqual([
			{ termId: 1, startIndex: 0, endIndex: 6, matchLength: 3 },
		]);
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
