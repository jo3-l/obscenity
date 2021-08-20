import { WhitelistedTermMatcher } from '../../src/matcher/WhitelistedTermMatcher';
import { createSimpleTransformer } from '../../src/transformer/Transformers';
import { CharacterCode } from '../../src/util/Char';

describe('constructor', () => {
	it('should not allow empty terms', () => {
		expect(() => new WhitelistedTermMatcher({ terms: [''] })).toThrow(new Error('Unexpected empty whitelisted term.'));
	});
});

describe('WhitelistedTermMatcher#getMatchedSpans', () => {
	it('should return an empty interval collection if there are no terms', () => {
		const matches = new WhitelistedTermMatcher({ terms: [] }).getMatchedSpans('hello world');
		expect(matches.size).toBe(0);
	});

	it.each([
		['should match a term at the start of the string', ['hello'], 'hello world', [[0, 4]]],
		['should match a term at the end of the string', ['world'], 'hello world', [[6, 10]]],
		['should be case sensitive (no match)', ['WORLD'], 'hello world', []],
		['should be case sensitive (with match)', ['yO'], 'hello yO yo', [[6, 7]]],
		['should support spaces in terms', ['hello W0rld'], 'hello world! hello W0rld!', [[13, 23]]],
		['should support surrogate pairs', ['cool 🌉'], 'cool cool cool cool 🌉', [[15, 21]]],
		[
			'should work with terms that are suffixes of other ones',
			['cool', 'cool beans'],
			'cool cool beans',
			[
				[0, 3],
				[5, 8],
				[5, 14],
			],
		],
		[
			'should work with terms that are suffixes of other ones, test 2',
			['he', 'she', 'his', 'her', 'here'],
			'he waited for she and her mom to go there',
			[
				[0, 1],
				[14, 16],
				[15, 16],
				[22, 23],
				[22, 24],
				[37, 40],
				[37, 38],
				[37, 39],
			],
		],
		['should only match on the term exactly', ['her'], 'h he! her', [[6, 8]]],
		[
			'should work with very long terms',
			['Pneumonoultramicroscopicsilicovolcanoconiosis', 'horrible'],
			'wow this word is quite long: Pneumonoultramicroscopicsilicovolcanoconiosie <- did you notice there was a typo there? horrible of me to do that... Pneumonoultramicroscopicsilicovolcanoconiosis',
			[
				[117, 124],
				[146, 190],
			],
		],
		[
			'should match several similar terms',
			['thing', 'thang'],
			'im just doin my thign thing ok thang',
			[
				[22, 26],
				[31, 35],
			],
		],
		['should work with terms that normalize to a different string', ['豈'], '豈', [[0, 0]]],
		['should handle null characters correctly', ['\u0000'], '\u0000', [[0, 0]]],
	])('%s', (_, terms, input, expected) => {
		const matches = new WhitelistedTermMatcher({ terms }).getMatchedSpans(input);
		expect([...matches]).toBePermutationOf(expected);
	});

	describe('transformers', () => {
		it('should work with transformers that skip chars', () => {
			const skipA = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? undefined : c));
			const matches = new WhitelistedTermMatcher({ terms: ['intriguing'], transformers: [skipA] }).getMatchedSpans(
				'hello world! inatrigauainagfoo bar.',
			);
			expect([...matches]).toBePermutationOf([[13, 26]]);
		});

		it('should work with transformers that change chars (no match)', () => {
			// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
			const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? CharacterCode.LowerA + 1 : c));
			const matches = new WhitelistedTermMatcher({ terms: ['hallo'], transformers: [changeAToB] }).getMatchedSpans(
				'hallo',
			);
			expect(matches.size).toBe(0);
		});

		it('should work with transformers that change chars (with match)', () => {
			// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/restrict-plus-operands
			const changeAToB = createSimpleTransformer((c) => (c === CharacterCode.LowerA ? CharacterCode.LowerA + 1 : c));
			const matches = new WhitelistedTermMatcher({ terms: ['hbllo'], transformers: [changeAToB] }).getMatchedSpans(
				'hallo',
			);
			expect([...matches]).toBePermutationOf([[0, 4]]);
		});
	});
});
