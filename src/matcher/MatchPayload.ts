/**
 * Data emitted by the pattern matcher on a successful match.
 *
 * The metadata emitted is intentionally minimal. For use cases which require
 * additional metadata, see the [[DataSet]] class, which permits one to
 * associate user-defined metadata with patterns.
 */
export interface MatchPayload {
	/**
	 * ID of the blacklisted term that matched.
	 */
	termId: number;

	/**
	 * Total number of of code points that matched.
	 */
	matchLength: number;

	/**
	 * Start index of the match, inclusive.
	 */
	startIndex: number;

	/**
	 * End index of the match, inclusive.
	 *
	 * If the last character of the pattern is a surrogate pair,
	 * then this points to the index of the low surrogate.
	 */
	endIndex: number;
}
