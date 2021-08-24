import type { Interval } from '../util/Interval';

export class IntervalCollection implements Iterable<Interval> {
	private dirty = false;
	private readonly intervals: Interval[] = [];

	public insert(lowerBound: number, upperBound: number) {
		this.intervals.push([lowerBound, upperBound]);
		this.dirty = true;
	}

	public query(lowerBound: number, upperBound: number) {
		if (this.intervals.length === 0) return false;
		if (this.dirty) {
			this.dirty = false;
			// Sort by lower bound.
			this.intervals.sort((a, b) => (a[0] < b[0] ? -1 : b[0] < a[0] ? 1 : 0));
		}

		for (const interval of this.intervals) {
			// Since the intervals are sorted by lower bound, if we see an
			// interval with a lower bound greater than the target, we can skip
			// checking all the ones after it as it's impossible that they fully
			// contain the target interval.
			if (interval[0] > lowerBound) break;
			if (interval[0] <= lowerBound && upperBound <= interval[1]) return true;
		}

		return false;
	}

	public values() {
		return this.intervals.values();
	}

	public [Symbol.iterator]() {
		return this.values();
	}
}
