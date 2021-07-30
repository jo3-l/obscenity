import { Interval } from './Interval';
import { ArrayBasedIntervalStorageStrategy } from './storage/ArrayBasedIntervalStorageStrategy';
import { IntervalStorageStrategy } from './storage/IntervalStorageStrategy';
import { TreeBasedIntervalStorageStrategy } from './storage/TreeBasedIntervalStorageStrategy';

export class IntervalCollection implements Iterable<Interval> {
	private storage: IntervalStorageStrategy = new ArrayBasedIntervalStorageStrategy();
	private currentImpl = IntervalStorageImpl.ArrayBased;

	public insert(interval: Interval) {
		this.storage.insert(interval);
		const impl = this.selectOptimalImpl();
		if (impl !== this.currentImpl) {
			const newStorage = this.createStorage(impl);
			this.transferIntervals(this.storage, newStorage);
			this.storage = newStorage;
			this.currentImpl = impl;
		}
	}

	public fullyContains(interval: Interval) {
		return this.storage.fullyContains(interval);
	}

	public get size() {
		return this.storage.size;
	}

	public values() {
		return this.storage.values();
	}

	public [Symbol.iterator]() {
		return this.values();
	}

	// TODO: Compute more precise thresholds.
	private selectOptimalImpl() {
		if (this.storage.size < 10) return IntervalStorageImpl.ArrayBased;
		return IntervalStorageImpl.TreeBased;
	}

	private createStorage(impl: IntervalStorageImpl): IntervalStorageStrategy {
		return impl === IntervalStorageImpl.ArrayBased
			? /* istanbul ignore next: createStorage is called if the storage strategy changes, and it cannot ever change from the tree-based strategy to the array-based strategy due to the fact that intervals cannot be removed. */
			  new ArrayBasedIntervalStorageStrategy()
			: new TreeBasedIntervalStorageStrategy();
	}

	private transferIntervals(from: IntervalStorageStrategy, to: IntervalStorageStrategy) {
		for (const interval of from) to.insert(interval);
	}
}

const enum IntervalStorageImpl {
	ArrayBased,
	TreeBased,
}
