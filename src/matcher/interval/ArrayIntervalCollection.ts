import type { Interval } from '../../util/Interval';
import type { IntervalCollection } from './IntervalCollection';

export class ArrayIntervalCollection implements IntervalCollection {
	private readonly intervals: Interval[] = [];

	public insert(lowerBound: number, upperBound: number) {
		this.intervals.push([lowerBound, upperBound]);
	}

	public fullyContains(lowerBound: number, upperBound: number) {
		return this.intervals.some((interval) => interval[0] <= lowerBound && upperBound <= interval[1]);
	}

	public get size() {
		return this.intervals.length;
	}

	public values() {
		return this.intervals.values();
	}

	public [Symbol.iterator]() {
		return this.values();
	}
}
