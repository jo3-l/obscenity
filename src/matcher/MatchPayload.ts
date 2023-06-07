import { compareIntervals } from '../util/Interval';

/**
 * Information emitted on a successful match.
 *
 * If you require more information about matches than what is provided here, see
 * the [[DataSet]] class, which supports associating metadata with patterns.
 */
export interface MatchPayload {
	/**
	 * End index of the match, inclusive.
	 *
	 * If the last character of the pattern is a surrogate pair,
	 * then this points to the index of the low surrogate.
	 */
	endIndex: number;

	/**
	 * Total number of of code points that matched.
	 */
	matchLength: number;

	/**
	 * Start index of the match, inclusive.
	 */
	startIndex: number;

	/**
	 * ID of the blacklisted term that matched.
	 */
	termId: number;
}

/**
 * Compares two match payloads.
 *
 * If the first match payload's start index is less than the second's, `-1` is
 *   returned;
 * If the second match payload's start index is less than the first's, `1` is
 *   returned;
 * If the first match payload's end index is less than the second's, `-1` is
 *   returned;
 * If the second match payload's end index is less than the first's, `1` is
 *   returned;
 * If the first match payload's term ID is less than the second's, `-1` is
 *   returned;
 * If the first match payload's term ID is equal to the second's, `0` is
 *   returned;
 * Otherwise, `1` is returned.
 *
 * @param a - First match payload.
 * @param b - Second match payload.
 * @returns The result of the comparison: -1 if the first should sort lower than
 * the second, 0 if they are the same, and 1 if the second should sort lower
 * than the first.
 */
export function compareMatchByPositionAndId(a: MatchPayload, b: MatchPayload) {
	const result = compareIntervals(a.startIndex, a.endIndex, b.startIndex, b.endIndex);
	if (result !== 0) return result;
	return a.termId === b.termId ? 0 : a.termId < b.termId ? -1 : 1;
}
