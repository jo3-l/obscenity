import type { MatchPayload } from './MatchPayload';

/**
 * Searches for blacklisted terms in text, ignoring parts matched by whitelisted
 * terms.
 *
 * See:
 * - [[NfaMatcher]] for an implementation using finite automata;
 * - [[RegExpMatcher]] for an implementation using regular expressions.
 *
 * Refer to the documentation of the classes mentioned above for discussion of
 * which circumstances one should prefer one over the other.
 */
export interface Matcher {
	/**
	 * Checks whether there is a match for any blacklisted term in the text.
	 *
	 * This is typically more efficient than calling `getAllMatches` and
	 * checking the result, though it depends on the implementation.
	 *
	 * @param input - Text to check.
	 */
	hasMatch(input: string): boolean;

	/**
	 * Returns all matches of blacklisted terms in the text.
	 *
	 * If you only need to check for the presence of a match, and do not need
	 * more specific information about the matches, use the `hasMatch()` method,
	 * which is typically more efficient.
	 *
	 * @param input - Text to find profanities in.
	 *
	 * @param sorted - Whether the resulting list of matches should be sorted
	 * using [[compareMatchByPositionAndId]]. Defaults to `false`.
	 *
	 * @returns A list of matches of the matcher on the text. The matches are
	 * guaranteed to be sorted if and only if the `sorted` parameter is `true`,
	 * otherwise, their order is unspecified.
	 */
	getAllMatches(input: string, sorted?: boolean): MatchPayload[];
}
