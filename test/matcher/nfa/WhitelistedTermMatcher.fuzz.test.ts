import * as fc from 'fast-check';
import { WhitelistedTermMatcher } from '../../../src/matcher/nfa/WhitelistedTermMatcher';
import type { Interval } from '../../../src/util/Interval';

test('running the whitelist matcher with a set of terms and input should have the same result as running the brute force string searching algorithm on it', () => {
	fc.assert(
		fc.property(
			fc.unicodeString().chain((input) => {
				// Generate patterns that are substrings of the input.
				const arbitrarySubstringPatterns =
					input.length < 2
						? fc.constant([])
						: fc.array(
								fc
									.tuple(fc.integer({ min: 0, max: input.length - 1 }), fc.integer({ min: 0, max: input.length - 1 }))
									.map(([a, b]) => {
										if (a > b) return input.slice(b, a);
										return input.slice(a, b);
									})
									.filter((p) => p.length > 0),
						  );
				return fc.tuple(
					fc.constant(input),
					fc.array(fc.unicodeString().filter((p) => p.length > 0)),
					arbitrarySubstringPatterns,
				);
			}),
			([input, randomPatterns, substrPatterns]) => {
				// Deduplicate the patterns.
				const set = new Set<string>();
				for (const pattern of randomPatterns) set.add(pattern);
				for (const pattern of substrPatterns) set.add(pattern);
				const allPatterns = [...set];
				const matcher = new WhitelistedTermMatcher({ terms: allPatterns });
				expect([...matcher.getMatches(input)]).toBePermutationOf(bruteForceMatch(allPatterns, input));
			},
		),
	);
});

function bruteForceMatch(patterns: string[], input: string) {
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
