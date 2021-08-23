import type { Interval } from '../../util/Interval';

export interface IntervalCollection extends Iterable<Interval> {
	insert(lowerBound: number, upperBound: number): void;
	fullyContains(lowerBound: number, upperBound: number): boolean;
	get size(): number;
	values(): IterableIterator<Interval>;
}
