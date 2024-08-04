/**
 * Information emitted on a successful match.
 *
 * If you require more information about matches than what is provided here, see the [[DataSet]]
 * class, which supports associating metadata with patterns.
 */
export interface MatchPayload {
	/**
	 * Start index of the match, inclusive.
	 */
	startIndex: number;

	/**
	 * End index of the match, **inclusive**.
	 *
	 * If the last code point of the match is encoded as a surrogate pair, then this points to the
	 * index of the low surrogate. Hence, `input.slice(match.startIndex, match.endIndex + 1)` always
	 * corresponds to the text matched.
	 */
	endIndex: number;

	/**
	 * Total number of Unicode code points that matched.
	 */
	matchLength: number;

	/**
	 * ID of the blacklisted term that matched.
	 */
	termId: number;
}

/**
 * Compares two match payloads by position, breaking ties by ID. That is, the start indices is
 * compared, then the end indices, and finally the term IDs.

 * @param a - First match payload.
 * @param b - Second match payload.
 * @returns The result of the comparison: -1 if the first should sort before the second, 0 if they
 * are equal, and 1 if the first should sort after the first.
 */
export function compareMatchByPositionAndId(a: MatchPayload, b: MatchPayload) {
	return cmp(a.startIndex, b.startIndex) || cmp(a.endIndex, b.endIndex) || cmp(a.termId, b.termId);
}

function cmp(a: number, b: number): number {
	if (a < b) return -1;
	else if (a === b) return 0;
	else return 1;
}
