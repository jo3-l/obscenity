import * as fc from 'fast-check';
import { Interval } from '../../src/matcher/interval/Interval';
import { WhitelistedTermMatcher } from '../../src/matcher/WhitelistedTermMatcher';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

test('running the whitelist matcher with a set of terms and input should have the same result as running the naive string searching algorithm on it', () => {
	fc.assert(
		fc.property(
			fc.string16bits().chain((input) => {
				const substringPatterns =
					input.length < 2
						? fc.constant([])
						: fc.array(
								fc
									.tuple(fc.integer(0, input.length - 1), fc.integer(0, input.length - 1))
									.map(([a, b]) => {
										if (a > b) [a, b] = [b, a];
										return input.slice(a, b);
									})
									.filter((p) => p.length > 0),
						  );
				return fc.tuple(fc.constant(input), fc.array(fc.string16bits().filter((p) => p.length > 0)), substringPatterns);
			}),
			([input, randPatterns, substrPatterns]) => {
				const allPatterns = [...randPatterns, ...substrPatterns];
				const matcher = new WhitelistedTermMatcher({ terms: allPatterns });
				expectThatArrayIsPermutationOfOther([...matcher.getMatchedSpans(input)], naiveMatch(allPatterns, input));
			},
		),
	);
});

function naiveMatch(patterns: string[], input: string) {
	const result: Interval[] = [];
	for (let i = 0; i < input.length; i++) {
		for (const pattern of patterns) {
			if (input.startsWith(pattern, i)) {
				result.push([i, i + pattern.length - 1]);
			}
		}
	}
	return result;
}
