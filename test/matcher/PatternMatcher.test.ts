import { assignIncrementingIds } from '../../src/matcher/BlacklistedTerm';
import { MatchPayload } from '../../src/matcher/MatchPayload';
import { PatternMatcher } from '../../src/matcher/PatternMatcher';
import { parseRawPattern, pattern } from '../../src/pattern/Pattern';

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
});

describe('PatternMatcher#setInput()', () => {
	it('should reset the position', () => {
		const matcher = new PatternMatcher({ blacklistedPatterns: [] });
		matcher.setInput('hi');
		matcher.next();
		matcher.setInput('bye');
		expect(matcher.position).toBe(-1);
	});

	it('should set the input', () => {
		const matcher = new PatternMatcher({ blacklistedPatterns: [] });
		matcher.setInput('hello');
		expect(matcher.input).toBe('hello');
	});
});

it('should match nothing if there are no patterns', () => {
	const m = new PatternMatcher({ blacklistedPatterns: [] });
	expect(m.setInput('').next()).toStrictEqual({ done: true, value: undefined });
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
	it.todo('tests');
});

describe('matching with wildcards', () => {
	it.todo('tests');
});

describe('matching with whitelisted terms', () => {
	it.todo('tests');
});

describe('matching with blacklist transformers', () => {
	it.todo('tests');
});

describe('matching with whitelist transformers', () => {
	it.todo('tests');
});

describe('forked traversal limiting', () => {
	it.todo('tests');
});

describe('misc matching tests', () => {
	it.todo('tests');
});

describe('PatternMatcher#getAllMatches()', () => {
	it.todo('tests');
});

describe('PatternMatcher#getFirstMatch()', () => {
	it.todo('tests');
});

describe('PatternMatcher#hasMatch()', () => {
	it.todo('tests');
});

describe('PatternMatcher#input', () => {
	it.todo('tests');
});

describe('PatternMatcher#position', () => {
	it.todo('tests');
});

describe('PatternMatcher#done', () => {
	it.todo('tests');
});

it.todo('should implement iterator protocol');
