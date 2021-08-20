import type { Interval } from '../Interval';
import type { IntervalStorageStrategy } from './IntervalStorageStrategy';

export class ArrayBasedIntervalStorageStrategy implements IntervalStorageStrategy {
	private readonly _intervals: Interval[] = [];

	public insert(interval: Interval) {
		this._intervals.push(interval);
	}

	public fullyContains(interval: Interval) {
		return this._intervals.some((cur) => interval[0] >= cur[0] && interval[1] <= cur[1]);
	}

	public get size() {
		return this._intervals.length;
	}

	public values() {
		return this._intervals.values();
	}

	public [Symbol.iterator]() {
		return this._intervals.values();
	}
}
