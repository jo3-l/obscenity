import { assignIncrementingIds } from '../../../src/matcher/BlacklistedTerm';
import type { MatchPayload } from '../../../src/matcher/MatchPayload';
import { NfaMatcher } from '../../../src/matcher/nfa/NfaMatcher';
import { WhitelistedTermMatcher } from '../../../src/matcher/nfa/WhitelistedTermMatcher';
import { parseRawPattern, pattern } from '../../../src/pattern/Pattern';
import { createSimpleTransformer } from '../../../src/transformer/Transformers';
import { skipNonAlphabeticTransformer } from '../../../src/transformer/skip-non-alphabetic';
import { CharacterCode } from '../../../src/util/Char';

describe('constructor', () => {
	it('should not accept patterns with the same id', () => {
		expect(
			() =>
				new NfaMatcher({
					blacklistedTerms: [
						{ id: 10, pattern: pattern`` },
						{ id: 10, pattern: pattern`yo` },
					],
				}),
		).toThrow(new Error('Found duplicate blacklisted term ID 10.'));
	});

	it('should not accept empty patterns', () => {
		expect(
			() =>
				new NfaMatcher({
					blacklistedTerms: [{ id: 10, pattern: pattern`` }],
				}),
		).toThrow('potentially matches empty string');
	});

	it('should not accept patterns with optionals that have the empty string in their match set', () => {
		expect(
			() =>
				new NfaMatcher({
					blacklistedTerms: [{ id: 10, pattern: pattern`[abc]` }],
				}),
		).toThrow('potentially matches empty string');
	});
});

it('should match nothing if there are no patterns', () => {
	const matcher = new NfaMatcher({ blacklistedTerms: [] });
	expect(matcher.getAllMatches('foo bar')).toHaveLength(0);
});

describe('simple matching; no wildcards/optionals', () => {
	it.each([
		[
			'should match a term at the start of the string',
			['hello'],
			'hello world',
			{
				0: [[0, 4]],
			},
		],
		[
			'should match a term at the end of the string',
			['world'],
			'hello world',
			{
				0: [[6, 10]],
			},
		],
		['should be case sensitive (no match)', ['WORLD'], 'hello world', []],
		['should be case sensitive (with match)', ['yO'], 'hello yO yo', { 0: [[6, 7]] }],
		[
			'should support spaces in terms',
			['hello W0rld'],
			'hello world! hello W0rld!',
			{
				0: [[13, 23]],
			},
		],
		[
			'should support surrogate pairs',
			['cool 🌉'],
			'cool cool cool cool 🌉',
			{
				0: [[15, 21]],
			},
		],
		[
			'should work with terms that are suffixes of other ones',
			['cool', 'cool beans'],
			'cool cool beans',
			{
				0: [
					[0, 3],
					[5, 8],
				],
				1: [[5, 14]],
			},
		],
		[
			'should work with terms that are suffixes of other ones, test 2',
			['he', 'she', 'his', 'her', 'here'],
			'he waited for she and her mom to go there',
			{
				0: [
					[0, 1],
					[15, 16],
					[22, 23],
					[37, 38],
				],
				1: [[14, 16]],
				3: [
					[37, 39],
					[22, 24],
				],
				4: [[37, 40]],
			},
		],
		['should only match on the term exactly', ['her'], 'h he! her', { 0: [[6, 8]] }],
		[
			'should work with very long terms',
			['Pneumonoultramicroscopicsilicovolcanoconiosis', 'horrible'],
			'wow this word is quite long: Pneumonoultramicroscopicsilicovolcanoconiosie <- did you notice there was a typo there? horrible of me to do that... Pneumonoultramicroscopicsilicovolcanoconiosis',
			{
				0: [[146, 190]],
				1: [[117, 124]],
			},
		],
		[
			'should match several similar terms',
			['thing', 'thang'],
			'im just doin my thign thing ok thang',
			{
				0: [[22, 26]],
				1: [[31, 35]],
			},
		],
		['should work with terms that normalize to a different string', ['豈'], '豈', { 0: [[0, 0]] }],
		['should work with the null character', ['\u0000'], '\u0000', { 0: [[0, 0]] }],
	])('%s', (_, patterns, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [idStr, matchData] of Object.entries(matches)) {
			const id = Number(idStr);
			for (const match of matchData) {
				expected.push({
					termId: id,
					startIndex: match[0],
					endIndex: match[1],
					matchLength: [...patterns[id]].length,
				});
			}
		}

		const matcher = new NfaMatcher({ blacklistedTerms: assignIncrementingIds(patterns.map(parseRawPattern)) });
		expect(matcher.getAllMatches(input)).toBePermutationOf(expected);
	});
});

describe('matching with optionals', () => {
	it('should emit matches with the correct ID', () => {
		const matches = new NfaMatcher({ blacklistedTerms: [{ id: 10, pattern: pattern`w[o]rld` }] }).getAllMatches(
			'world wrld',
		);
		expect(matches).toHaveLength(2);
		expect(matches[0].termId).toBe(10);
		expect(matches[1].termId).toBe(10);
	});

	it.each([
		[
			'should match a single pattern with an optional at the start',
			['[a]bc'],
			'abc bc',
			{
				0: [
					[0, 2, 3],
					[1, 2, 2],
					[4, 5, 2],
				],
			},
		],
		[
			'should match a single pattern with an optional at the end',
			['bc[d]'],
			'cant think of any good strings bc :(d',
			{
				0: [[31, 32, 2]],
			},
		],
		[
			'should match a single pattern with an optional in the middle',
			['b[c]d'],
			'getting tired of writing tests, bcd bd :P',
			{
				0: [
					[32, 34, 3],
					[36, 37, 2],
				],
			},
		],
		[
			'should match a single pattern with an optional wildcard',
			['pi[?]kle'],
			'pickles are good and so are pikles, whatever those are',
			{
				0: [
					[0, 5, 6],
					[28, 32, 5],
				],
			},
		],
		[
			'should match several patterns with optionals',
			['s[?]m[e]th', 's[?]metimes'],
			'sometimes i like smth',
			{
				0: [[17, 20, 4]],
				1: [[0, 8, 9]],
			},
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

		const matcher = new NfaMatcher({ blacklistedTerms: assignIncrementingIds(patterns.map(parseRawPattern)) });
		expect(matcher.getAllMatches(input)).toBePermutationOf(expected);
	});
});

describe('matching with wildcards', () => {
	it.each([
		[
			'should match a pattern that only contains wildcards',
			['??', '?'],
			'abc',
			{
				0: [
					[0, 1],
					[1, 2],
				],
				1: [
					[0, 0],
					[1, 1],
					[2, 2],
				],
			},
		],
		[
			'should match a single pattern with an wildcard at the end correctly',
			['hello?'],
			'hellom world',
			{
				0: [[0, 5]],
			},
		],
		[
			'should match a single pattern with a wildcard at the start correctly',
			['?world'],
			'my world',
			{
				0: [[2, 7]],
			},
		],
		[
			'should match a single pattern with a wildcard in the middle correctly',
			['?world?'],
			'the world!',
			{
				0: [[3, 9]],
			},
		],
		[
			'should match several patterns with wildcards in varying positions correctly',
			['?start', 'end?', 'mid?le?'],
			'look, wildcards can be at the start, the end, or the middle!',
			{
				0: [[29, 34]],
				1: [[41, 44]],
				2: [[53, 59]],
			},
		],
		[
			'should match two patterns where the first is a proper suffix of the latter and has a wildcard correctly',
			['hello', 'ell?'],
			'hey, hello there!',
			{
				0: [[5, 9]],
				1: [[6, 9]],
			},
		],
		[
			'should match four patterns where the first is a proper suffix of the second, similar with the second and so on',
			['l?', 'll?', 'ell?', 'hello'],
			'test test test hello??',
			{
				0: [
					[17, 18],
					[18, 19],
				],
				1: [[17, 19]],
				2: [[16, 19]],
				3: [[15, 19]],
			},
		],
		[
			'should match two patterns where one is a single wildcard and the second is a literal',
			['a!', '?'],
			'a! ',
			{
				0: [[0, 1]],
				1: [
					[0, 0],
					[1, 1],
					[2, 2],
				],
			},
		],
		[
			'should treat surrogate pairs as a single character and thus match a wildcard',
			['night', 'cool ?'],
			'what a cool 🌉 night sky',
			{
				0: [[15, 19]],
				1: [[7, 13]],
			},
		],
		[
			'should not match patterns with leading wildcards if there are insufficient characters at the start',
			['??bye'],
			'dbye',
			{},
		],
		[
			'should not match patterns with trailing wildcards if there are insufficient characters at the end',
			['hi????'],
			'hid',
			{},
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
					matchLength: [...patterns[id]].length,
				});
			}
		}

		const matcher = new NfaMatcher({ blacklistedTerms: assignIncrementingIds(patterns.map(parseRawPattern)) });
		expect(matcher.getAllMatches(input)).toBePermutationOf(expected);
	});
});

describe('matching with word boundaries', () => {
	it.each([
		// normal patterns
		[
			'should not emit matches for patterns which require a word boundary at the start if the matched segment has a word char before it',
			['|cool'],
			'something is quitecool',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char before it',
			['|beans'],
			'delicious beans',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment begins at the start of the string',
			['|things'],
			'things are cool',
			{
				0: [[0, 5, 6]],
			},
		],
		[
			'should not emit matches for patterns which require a word boundary at the end if the matched segment does not have a non-word char after it',
			['cool|'],
			'something is quite coolbeans',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it',
			['beans|'],
			'delicious beans yes',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment ends at the eof',
			['things|'],
			'there are many things',
			{
				0: [[15, 20, 6]],
			},
		],

		// normal patterns w/ non-word chars
		[
			'should not emit matches for patterns which require a word boundary at the start if the matched segment has a word char before it (pattern has non-word char near the start)',
			['|c!ol'],
			'something is quitec!ol',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char before it (pattern has non-word char near the start)',
			['|b*ans'],
			'delicious b*ans',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment begins at the start of the string (pattern has non-word char near the start)',
			['|t^ings'],
			't^ings are cool',
			{
				0: [[0, 5, 6]],
			},
		],
		[
			'should not emit matches for patterns which require a word boundary at the end if the matched segment does not have a non-word char after it (pattern has non-word char near the end)',
			['co#l|'],
			'something is quite co#lbeans',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it (pattern has non-word char near the end)',
			['bea!s|'],
			'delicious bea!s yes',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment ends at the eof (pattern has non-word char near the end)',
			['thin$s|'],
			'there are many thin$s',
			{
				0: [[15, 20, 6]],
			},
		],

		// patterns with wildcards
		[
			'should not emit matches for patterns which require a word boundary at the start if the matched segment does not have a non-word char after it (with wildcards)',
			['|c?ol'],
			'something is quitecool',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it (with wildcards)',
			['|be?ns'],
			'delicious beans',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment begins at the start of the string (with wildcards)',
			['|?hings'],
			'things are cool',
			{
				0: [[0, 5, 6]],
			},
		],
		[
			'should not emit matches for patterns which require a word boundary at the end if the matched segment does not have a non-word char after it (with wildcards)',
			['?ool|'],
			'something is quite coolbeans',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it (with wildcards)',
			['be?ns|'],
			'delicious beans yes',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment ends at the eof (with wildcards)',
			['thing?|'],
			'there are many things',
			{
				0: [[15, 20, 6]],
			},
		],
		[
			'should match a pattern with only wildcards and a word boundary at the start correctly',
			['|??'],
			'myby',
			{
				0: [[0, 1, 2]],
			},
		],
		[
			'should match a pattern with only wildcards and a word boundary at the end correctly',
			['??|'],
			'myby',
			{
				0: [[2, 3, 2]],
			},
		],

		// patterns with wildcards and non-word chars
		[
			'should not emit matches for patterns which require a word boundary at the start if the matched segment does not have a non-word char after it (with wildcards and a non-word char near the start)',
			['|c!?ol'],
			'something is quitec!ool',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it (with wildcards and a non-word char near the start)',
			['|b$e?ns'],
			'delicious b$eans',
			{
				0: [[10, 15, 6]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment begins at the start of the string (with wildcards and a non-word char near the start)',
			['|?^ings'],
			't^ings are cool',
			{
				0: [[0, 5, 6]],
			},
		],
		[
			'should not emit matches for patterns which require a word boundary at the end if the matched segment does not have a non-word char after it (with wildcards and a non-word char near the end)',
			['?o_l|'],
			'something is quite coolbeans',
			{},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment has a non-word char after it (with wildcards and a non-word char near the end)',
			['be?%s|'],
			'delicious bea%s yes',
			{
				0: [[10, 14, 5]],
			},
		],
		[
			'should emit matches for patterns which require a word boundary at the start if the matched segment ends at the eof (with wildcards and a non-word char near the end)',
			['thin*?|'],
			'there are many thin*s',
			{
				0: [[15, 20, 6]],
			},
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

		const matcher = new NfaMatcher({ blacklistedTerms: assignIncrementingIds(patterns.map(parseRawPattern)) });
		expect(matcher.getAllMatches(input)).toBePermutationOf(expected);
	});
});

describe('matching with whitelisted terms', () => {
	it('should call the getMatches() method of the WhitelistedTermMatcher with the input', () => {
		const spy = jest.spyOn(WhitelistedTermMatcher.prototype, 'getMatches');
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`thing` }],
			blacklistMatcherTransformers: [skipNonAlphabeticTransformer()],
			whitelistedTerms: ['thi ing'],
		});
		matcher.getAllMatches('the thi ing');
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith('the thi ing');
	});

	it('should not match parts of the text which are completely matched by a whitelisted term', () => {
		const matcher = new NfaMatcher({
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
		const matcher = new NfaMatcher({
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
});

describe('matching with blacklist transformers', () => {
	it('should skip characters which became undefined after transformation', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new NfaMatcher({
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
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`sa?e` }],
			blacklistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('same')).toHaveLength(0);
	});

	it('should work with transformers that change chars (with match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
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
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const ignoreAllAs = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`bbb` }],
			whitelistedTerms: ['aabbbaa'],
			blacklistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.getAllMatches('!!!! $$aabbbaa## !!!')).toHaveLength(0);
	});

	it('should work with patterns that have trailing wildcards', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`trailing?` }],
			whitelistedTerms: [],
			blacklistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.getAllMatches(' !!!! $$ t r a   i l    i    n  g## !!!')).toStrictEqual([
			{
				termId: 1,
				startIndex: 9,
				endIndex: 33,
				matchLength: 9,
			},
		]);
	});
});

describe('matching with whitelist transformers', () => {
	it('should work with transformers which become undefined after transformation', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`world` }],
			whitelistedTerms: ['helloworld!'],
			whitelistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.getAllMatches('h e l l o world!')).toHaveLength(0);
	});

	it('should work with transformers that change chars (no match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`biash` }],
			whitelistedTerms: ['a biash'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('the a biash was')).toStrictEqual([
			{ termId: 1, startIndex: 6, endIndex: 10, matchLength: 5 },
		]);
	});

	it('should work with transformers that change chars (with match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`ass` }],
			whitelistedTerms: ['bss'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.getAllMatches('a big ass')).toHaveLength(0);
	});

	it('should not affect matching of blacklisted terms', () => {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const ignoreAllAs = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new NfaMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`dader` }],
			whitelistedTerms: ['a dader'],
			whitelistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.getAllMatches('there is a dader')).toStrictEqual([
			{ termId: 1, startIndex: 11, endIndex: 15, matchLength: 5 },
		]);
	});
});

describe('NfaMatcher#getAllMatches()', () => {
	describe('result match order', () => {
		it('should be sorted if the sorted parameter is set to true', () => {
			const matcher = new NfaMatcher({
				blacklistedTerms: assignIncrementingIds([pattern`sup`, pattern`u?`, pattern`dude`]),
			});
			expect(matcher.getAllMatches('sup guys there are some dudes here', true)).toStrictEqual([
				{ termId: 0, startIndex: 0, endIndex: 2, matchLength: 3 },
				{ termId: 1, startIndex: 1, endIndex: 2, matchLength: 2 },
				{ termId: 1, startIndex: 5, endIndex: 6, matchLength: 2 },
				{ termId: 2, startIndex: 24, endIndex: 27, matchLength: 4 },
				{ termId: 1, startIndex: 25, endIndex: 26, matchLength: 2 },
			]);
		});
	});

	it('should work when called several times in a row', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`foobar`, pattern`hello`]),
			whitelistedTerms: ['the foobar'],
		});
		expect(matcher.getAllMatches('the foobar is quite foobar hello yo')).toBePermutationOf([
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
		expect(matcher.getAllMatches('the foobar is quite foobar hello yo')).toBePermutationOf([
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
		expect(matcher.getAllMatches('the foobar is quite foobar hello yo')).toBePermutationOf([
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
	});
});

describe('NfaMatcher#hasMatch()', () => {
	it('should be true if there is a match', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`there`, pattern`yo there hi`]),
		});
		expect(matcher.hasMatch('the yo there has a yo there')).toBeTruthy();
	});

	it('should be falsy if there is no match', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`yo`]),
		});
		expect(matcher.hasMatch('no y-word here!')).toBeFalsy();
	});

	it('should not return true if a match with incorrect word boundaries is found', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`|xs`]),
		});
		expect(matcher.hasMatch('yoxs')).toBeFalsy();
	});

	it('should return true if there is a match for a pattern with a wildcard at the end', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`x?`]),
		});
		expect(matcher.hasMatch('my xo')).toBeTruthy();
	});

	it('should return true if there is a match for a pattern that only contains wildcards', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`??`]),
		});
		expect(matcher.hasMatch('xy')).toBeTruthy();
	});

	it('should return true if there a match for a pattern that contains wildcards at the start (only 1 pattern)', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`?x`]),
		});
		expect(matcher.hasMatch('foo bar quux')).toBeTruthy();
	});

	it('should return true if there is a match for a pattern that contains wildcards at the start (two patterns)', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`?a`, pattern`?ba|`]),
		});
		expect(matcher.hasMatch('xbac')).toBeTruthy();
	});

	it('should work when called several times in a row', () => {
		const matcher = new NfaMatcher({
			blacklistedTerms: assignIncrementingIds([pattern`yo there`]),
			whitelistedTerms: ['the yo there'],
		});
		expect(matcher.hasMatch('the yo there has a yo there')).toBeTruthy();
		expect(matcher.hasMatch('the yo there has a yo there')).toBeTruthy();
		expect(matcher.hasMatch('the yo there has a yo there')).toBeTruthy();
	});
});
