import type { ParsedPattern } from '../pattern/Nodes';

/**
 * Represents a blacklisted term.
 */
export interface BlacklistedTerm {
	/**
	 * The identifier of the pattern; should be unique across all patterns.
	 */
	id: number;

	/**
	 * The parsed pattern.
	 */
	pattern: ParsedPattern;
}

/**
 * Assigns incrementing IDs to the patterns provided, starting with 0. It is
 * useful if you have a list of patterns to match against but don't care about
 * identifying which pattern matched.
 *
 * @example
 * ```typescript
 * const matcher = new RegExpMatcher({
 *  ...,
 *  blacklistedTerms: assignIncrementingIds([
 *      pattern`f?uck`,
 *      pattern`|shit|`,
 *  ]),
 * });
 * ```
 *
 * @param patterns - List of parsed patterns.
 * @returns A list of blacklisted terms with valid IDs which can then be passed
 * to the [[RegExpMatcher]] or [[NfaMatcher]].
 */
export function assignIncrementingIds(patterns: ParsedPattern[]) {
	let currentId = 0;
	return patterns.map<BlacklistedTerm>((pattern) => ({ id: currentId++, pattern }));
}
