import { CharacterCode, isLowerCase } from '../../util/Char';
import { ArrayBasedEdgeStorageStrategy } from './edge-storage/ArrayBasedEdgeStorageStrategy';
import { BucketBasedEdgeStorageStrategy } from './edge-storage/BucketBasedEdgeStorageStrategy';
import type { Edge, EdgeStorageStrategy } from './edge-storage/EdgeStorageStrategy';
import { MapBasedEdgeStorageStrategy } from './edge-storage/MapBasedEdgeStorageStrategy';

export class EdgeList<T> implements Iterable<Edge<T>> {
	private storage: EdgeStorageStrategy<T> = new ArrayBasedEdgeStorageStrategy();
	private currentImpl = EdgeStorageImpl.ArrayBased;
	// The bucket storage strategy is arguably the most performant but only works
	// for a limited set of characters. Currently, to put a cap on the number of buckets,
	// only lower-case alphabetic ASCII characters are supported.
	private canUseBuckets = true;

	public set(char: number, node: T) {
		this.canUseBuckets = this.canUseBuckets && isLowerCase(char);
		const needsImplSwitch = !this.canUseBuckets && this.currentImpl === EdgeStorageImpl.BucketBased;
		if (needsImplSwitch) {
			// Current character is not supported by the bucket implementation, so switch to one that does.
			this.useOptimalImpl();
		}

		this.storage.set(char, node);
		if (!needsImplSwitch) this.useOptimalImpl();
	}

	public get(char: number) {
		return this.storage.get(char);
	}

	public clear() {
		this.canUseBuckets = true;
		this.storage.clear();
		this.useOptimalImpl();
	}

	public get size() {
		return this.storage.size;
	}

	public chars() {
		return this.storage.chars();
	}

	public nodes() {
		return this.storage.nodes();
	}

	public [Symbol.iterator]() {
		return this.storage[Symbol.iterator]();
	}

	private useOptimalImpl() {
		const impl = this.selectOptimalImpl();
		if (impl !== this.currentImpl) {
			const newStorage = this.createStorage(impl);
			this.transferEdges(this.storage, newStorage);
			this.storage = newStorage;
			this.currentImpl = impl;
		}
	}

	private selectOptimalImpl() {
		if (this.storage.size < 10) return EdgeStorageImpl.ArrayBased;
		if (this.storage.size <= 26 && this.canUseBuckets) return EdgeStorageImpl.BucketBased;
		return EdgeStorageImpl.MapBased;
	}

	private createStorage(impl: EdgeStorageImpl): EdgeStorageStrategy<T> {
		switch (impl) {
			case EdgeStorageImpl.ArrayBased:
				return new ArrayBasedEdgeStorageStrategy();
			case EdgeStorageImpl.BucketBased:
				return new BucketBasedEdgeStorageStrategy({
					charToBucketMapper: (c) => c - CharacterCode.LowerA,
					bucketToCharMapper: (b) => b + CharacterCode.LowerA,
				});
			case EdgeStorageImpl.MapBased:
				return new MapBasedEdgeStorageStrategy();
		}
	}

	private transferEdges(from: EdgeStorageStrategy<T>, to: EdgeStorageStrategy<T>) {
		for (const [char, node] of from) to.set(char, node);
	}
}

const enum EdgeStorageImpl {
	ArrayBased,
	BucketBased,
	MapBased,
}
