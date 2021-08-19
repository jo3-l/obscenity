import fc from 'fast-check';
import { Interval } from '../../src/matcher/interval/Interval';
import { WhitelistedTermMatcher } from '../../src/matcher/WhitelistedTermMatcher';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

test('running the whitelisted term matcher with a set of terms s and input i should have the same result as naively matching the terms using indexOf', () => {
	fc.assert(
		fc.property(fc.array(fc.string16bits().filter((s) => s.length > 0)), fc.string16bits(), (terms, input) => {
			const matcher = new WhitelistedTermMatcher({ terms });
			expectThatArrayIsPermutationOfOther([...matcher.getMatchedSpans(input)], naiveMatch(terms, input));
		}),
	);
});

function naiveMatch(terms: string[], input: string) {
	const matches: Interval[] = [];
	for (let i = 0; i < input.length; i++) {
		for (const term of terms) {
			if (input.startsWith(term, i)) {
				matches.push([i, i + term.length - 1]);
			}
		}
	}
	return matches;
}
