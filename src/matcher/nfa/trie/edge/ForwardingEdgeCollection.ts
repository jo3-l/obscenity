import { isLowerCase } from '../../../../util/Char';
import { ArrayEdgeCollection } from './ArrayEdgeCollection';
import { BucketEdgeCollection } from './BucketEdgeCollection';
import type { EdgeCollection } from './EdgeCollection';

export class ForwardingEdgeCollection<T> implements EdgeCollection<T> {
	private _underlyingImplementation: EdgeCollection<T> = new ArrayEdgeCollection<T>();
	private implementation = Implementation.Array;
	private areKeysAllLowerCase = true;

	public set(char: number, node: T) {
		this.areKeysAllLowerCase &&= isLowerCase(char);
		if (!this.areKeysAllLowerCase && this.implementation === Implementation.Bucket) {
			this.useImplementation(this.selectImplementation());
		}

		this._underlyingImplementation.set(char, node);
		this.useImplementation(this.selectImplementation());
	}

	public get(char: number) {
		return this._underlyingImplementation.get(char);
	}

	public get size() {
		return this._underlyingImplementation.size;
	}

	public keys() {
		return this._underlyingImplementation.keys();
	}

	public values() {
		return this._underlyingImplementation.values();
	}

	public get underlyingImplementation() {
		return this._underlyingImplementation;
	}

	public [Symbol.iterator]() {
		return this._underlyingImplementation[Symbol.iterator]();
	}

	private selectImplementation() {
		// These thresholds are all somewhat arbitrary as all implementations
		// execute in less than one-tenth of a millisecond at the scale we're at
		// here. However, micro-benchmarks point to the bucket implementation
		// always being faster when it's applicable (lower-case ASCII
		// characters). As it's not very memory-efficient for small numbers of
		// edges, we use the array implementation if the size is less than 10
		// and the bucket implementation otherwise.
		//
		// When the bucket implementation is not available we choose between the
		// array and map implementation. Both are fairly fast; though the map is
		// fastest, the difference is not noticeable until ~50-60 edges are
		// being stored. Thus, as the array implementation uses less memory, we
		// choose it for medium sized collections and use the map implementation
		// in all other cases.
		if (this.size <= 10) return Implementation.Array;
		if (this.areKeysAllLowerCase) return Implementation.Bucket;
		if (this.size <= 35) return Implementation.Array;
		return Implementation.Map;
	}

	private useImplementation(newImplementation: Implementation) {
		if (this.implementation === newImplementation) return;
		const newCollection = this.instantiateImplementation(newImplementation);
		for (const [k, v] of this._underlyingImplementation) newCollection.set(k, v);
		this._underlyingImplementation = newCollection;
		this.implementation = newImplementation;
	}

	private instantiateImplementation(implementation: Implementation): EdgeCollection<T> {
		switch (implementation) {
			case Implementation.Array:
				/* istanbul ignore next: instantiateImplementation() should never be called with Array */
				return new ArrayEdgeCollection();
			case Implementation.Bucket:
				return new BucketEdgeCollection();
			case Implementation.Map:
				return new Map<number, T>();
		}
	}
}

const enum Implementation {
	Array,
	Bucket,
	Map,
}
