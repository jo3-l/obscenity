import { Interval } from '../Interval';

export interface IntervalStorageStrategy extends Iterable<Interval> {
	insert(interval: Interval): void;
	fullyContains(interval: Interval): boolean;
	get size(): number;
	values(): IterableIterator<Interval>;
}
