import { assignIncrementingIds } from '../../src/matcher/BlacklistedTerm';
import { ForkedTraversalLimitExceededError } from '../../src/matcher/ForkedTraversalLimitExceededError';
import type { MatchPayload } from '../../src/matcher/MatchPayload';
import { PatternMatcher } from '../../src/matcher/PatternMatcher';
import { parseRawPattern, pattern } from '../../src/pattern/Pattern';
import { createSimpleTransformer } from '../../src/transformer/Transformers';
import { CharacterCode } from '../../src/util/Char';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

describe('constructor', () => {
	it('should not accept patterns with the same id', () => {
		expect(
			() =>
				new PatternMatcher({
					blacklistedPatterns: [
						{ id: 10, pattern: pattern`` },
						{ id: 10, pattern: pattern`yo` },
					],
				}),
		).toThrow(new Error('Found duplicate blacklisted term ID 10.'));
	});

	it('should not accept empty patterns', () => {
		expect(
			() =>
				new PatternMatcher({
					blacklistedPatterns: [{ id: 10, pattern: pattern`` }],
				}),
		).toThrow(new Error('Unexpected empty blacklisted term.'));
	});

	it('should not accept patterns with optionals that have the empty string in their match set', () => {
		expect(
			() =>
				new PatternMatcher({
					blacklistedPatterns: [{ id: 10, pattern: pattern`[abc]` }],
				}),
		).toThrow(
			new Error(
				'Unexpected pattern that matches on the empty string; this is probably due to a pattern comprised of a single optional construct.',
			),
		);
	});
});

describe('PatternMatcher#setInput()', () => {
	it('should set the input', () => {
		const matcher = new PatternMatcher({ blacklistedPatterns: [] });
		matcher.setInput('hello');
		expect(matcher.input).toBe('hello');
	});
});

it('should match nothing if there are no patterns', () => {
	const m = new PatternMatcher({ blacklistedPatterns: [] });
	expect(m.setInput('foo bar').getAllMatches()).toHaveLength(0);
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
	])('%s', (_, pats, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [id, locs] of Object.entries(matches)) {
			const idNum = Number(id);
			for (const loc of locs) {
				expected.push({
					termId: idNum,
					startIndex: loc[0],
					endIndex: loc[1],
					matchLength: [...pats[idNum]].length,
				});
			}
		}

		const matcher = new PatternMatcher({ blacklistedPatterns: assignIncrementingIds(pats.map(parseRawPattern)) });
		expectThatArrayIsPermutationOfOther(matcher.setInput(input).getAllMatches(), expected);
	});
});

describe('matching with optionals', () => {
	it('should emit matches with the correct ID', () => {
		const ms = new PatternMatcher({ blacklistedPatterns: [{ id: 10, pattern: pattern`w[o]rld` }] })
			.setInput('world wrld')
			.getAllMatches();
		expect(ms).toHaveLength(2);
		expect(ms[0].termId).toBe(10);
		expect(ms[1].termId).toBe(10);
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
	])('%s', (_, pats, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [id, data] of Object.entries(matches)) {
			const idNum = Number(id);
			for (const datum of data) {
				expected.push({
					termId: idNum,
					startIndex: datum[0],
					endIndex: datum[1],
					matchLength: datum[2],
				});
			}
		}

		const matcher = new PatternMatcher({ blacklistedPatterns: assignIncrementingIds(pats.map(parseRawPattern)) });
		expectThatArrayIsPermutationOfOther(matcher.setInput(input).getAllMatches(), expected);
	});
});

describe('matching with wildcards', () => {
	it.each([
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
	])('%s', (_, pats, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [id, locs] of Object.entries(matches)) {
			const idNum = Number(id);
			for (const loc of locs) {
				expected.push({
					termId: idNum,
					startIndex: loc[0],
					endIndex: loc[1],
					matchLength: [...pats[idNum]].length,
				});
			}
		}

		const matcher = new PatternMatcher({ blacklistedPatterns: assignIncrementingIds(pats.map(parseRawPattern)) });
		expectThatArrayIsPermutationOfOther(matcher.setInput(input).getAllMatches(), expected);
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
	])('%s', (_, pats, input, matches) => {
		const expected: MatchPayload[] = [];
		for (const [id, data] of Object.entries(matches)) {
			const idNum = Number(id);
			for (const datum of data) {
				expected.push({
					termId: idNum,
					startIndex: datum[0],
					endIndex: datum[1],
					matchLength: datum[2],
				});
			}
		}

		const matcher = new PatternMatcher({ blacklistedPatterns: assignIncrementingIds(pats.map(parseRawPattern)) });
		expectThatArrayIsPermutationOfOther(matcher.setInput(input).getAllMatches(), expected);
	});
});

describe('matching with whitelisted terms', () => {
	it('should not match parts of the text which are completely matched by a whitelisted term', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`penis` }],
			whitelistedTerms: ['pen is'],
		});
		expect(matcher.setInput('the pen is mightier than the penis').getAllMatches()).toStrictEqual([
			{
				termId: 1,
				startIndex: 29,
				endIndex: 33,
				matchLength: 5,
			},
		]);
	});

	it('should match parts of the text that only overlap (and are not completely contained) by a whitelisted term', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`bitch` }],
			whitelistedTerms: ['bit', 'itch'],
		});
		expect(matcher.setInput('a bitch').getAllMatches()).toStrictEqual([
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
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`something` }],
			blacklistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.setInput('s o m e t h i n  g').getAllMatches()).toStrictEqual([
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
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`sa?e` }],
			blacklistMatcherTransformers: [changeAToB],
		});
		expect(matcher.setInput('same').getAllMatches()).toHaveLength(0);
	});

	it('should work with transformers that change chars (with match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`hbllo?` }],
			blacklistMatcherTransformers: [changeAToB],
		});
		expect(matcher.setInput('sup hallothere').getAllMatches()).toStrictEqual([
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
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`bbb` }],
			whitelistedTerms: ['aabbbaa'],
			blacklistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.setInput('!!!! $$aabbbaa## !!!').getAllMatches()).toHaveLength(0);
	});
});

describe('matching with whitelist transformers', () => {
	it('should work with transformers which become undefined after transformation', () => {
		const skipSpaces = createSimpleTransformer((c) => (c === 32 ? undefined : c));
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`world` }],
			whitelistedTerms: ['helloworld!'],
			whitelistMatcherTransformers: [skipSpaces],
		});
		expect(matcher.setInput('h e l l o world!').getAllMatches()).toHaveLength(0);
	});

	it('should work with transformers that change chars (no match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`biash` }],
			whitelistedTerms: ['a biash'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.setInput('the a biash was').getAllMatches()).toStrictEqual([
			{ termId: 1, startIndex: 6, endIndex: 10, matchLength: 5 },
		]);
	});

	it('should work with transformers that change chars (with match)', () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
		const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`ass` }],
			whitelistedTerms: ['bss'],
			whitelistMatcherTransformers: [changeAToB],
		});
		expect(matcher.setInput('a big ass').getAllMatches()).toHaveLength(0);
	});

	it('should not affect matching of blacklisted terms', () => {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const ignoreAllAs = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? c + 1 : c));
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 1, pattern: pattern`dader` }],
			whitelistedTerms: ['a dader'],
			whitelistMatcherTransformers: [ignoreAllAs],
		});
		expect(matcher.setInput('there is a dader').getAllMatches()).toStrictEqual([
			{ termId: 1, startIndex: 11, endIndex: 15, matchLength: 5 },
		]);
	});
});

describe('forked traversal limiting', () => {
	it('should throw an error if the number of forked traversals exceeds the limit', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: [{ id: 0, pattern: pattern`?` }],
			forkedTraversalLimit: 0,
		});
		expect(() => matcher.setInput('hi').getAllMatches()).toThrow(new ForkedTraversalLimitExceededError('hi', 0, 1, 0));
	});

	it('should not throw an error if the number of forked traversals exceeds the limit', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: assignIncrementingIds([pattern`foobar`, pattern`barbuz`, pattern`buzbaz`, pattern`bazd`]),
			forkedTraversalLimit: 0,
		});
		expectThatArrayIsPermutationOfOther(matcher.setInput('i really liked the foobarbuzbazd').getAllMatches(), [
			{ termId: 0, startIndex: 19, endIndex: 24, matchLength: 6 },
			{ termId: 1, startIndex: 22, endIndex: 27, matchLength: 6 },
			{ termId: 2, startIndex: 25, endIndex: 30, matchLength: 6 },
			{ termId: 3, startIndex: 28, endIndex: 31, matchLength: 4 },
		]);
	});
});

describe('PatternMatcher#getAllMatches()', () => {
	describe('result match order', () => {
		it('should be sorted if the sorted parameter is set to true', () => {
			const matcher = new PatternMatcher({
				blacklistedPatterns: assignIncrementingIds([pattern`sup`, pattern`u?`, pattern`dude`]),
			});
			expect(matcher.setInput('sup guys there are some dudes here').getAllMatches(true)).toStrictEqual([
				{ termId: 0, startIndex: 0, endIndex: 2, matchLength: 3 },
				{ termId: 1, startIndex: 1, endIndex: 2, matchLength: 2 },
				{ termId: 1, startIndex: 5, endIndex: 6, matchLength: 2 },
				{ termId: 2, startIndex: 24, endIndex: 27, matchLength: 4 },
				{ termId: 1, startIndex: 25, endIndex: 26, matchLength: 2 },
			]);
		});
	});

	it('should work when called several times in a row', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: assignIncrementingIds([pattern`foobar`, pattern`hello`]),
			whitelistedTerms: ['the foobar'],
		});
		matcher.setInput('the foobar is quite foobar hello yo');
		expectThatArrayIsPermutationOfOther(matcher.getAllMatches(), [
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
		expectThatArrayIsPermutationOfOther(matcher.getAllMatches(), [
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
		expectThatArrayIsPermutationOfOther(matcher.getAllMatches(), [
			{ termId: 0, startIndex: 20, endIndex: 25, matchLength: 6 },
			{ termId: 1, startIndex: 27, endIndex: 31, matchLength: 5 },
		]);
	});
});

describe('PatternMatcher#hasMatch()', () => {
	it('should be true if there is a match', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: assignIncrementingIds([pattern`yo there`]),
			whitelistedTerms: ['the yo there'],
		});
		expect(matcher.setInput('the yo there has a yo there').hasMatch()).toBeTruthy();
	});

	it('should be falsy if there is no match', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: assignIncrementingIds([pattern`yo`]),
		});
		expect(matcher.setInput('no y-word here!').hasMatch()).toBeFalsy();
	});

	it('should work when called several times in a row', () => {
		const matcher = new PatternMatcher({
			blacklistedPatterns: assignIncrementingIds([pattern`yo there`]),
			whitelistedTerms: ['the yo there'],
		});
		matcher.setInput('the yo there has a yo there');
		expect(matcher.hasMatch()).toBeTruthy();
		expect(matcher.hasMatch()).toBeTruthy();
		expect(matcher.hasMatch()).toBeTruthy();
	});
});

describe('PatternMatcher#input', () => {
	it('should default to the empty string', () => {
		expect(new PatternMatcher({ blacklistedPatterns: [] }).input).toBe('');
	});

	it('should be the input', () => {
		const matcher = new PatternMatcher({ blacklistedPatterns: [] });
		matcher.setInput('hi');
		expect(matcher.input).toBe('hi');
		matcher.setInput('bye');
		expect(matcher.input).toBe('bye');
	});
});
