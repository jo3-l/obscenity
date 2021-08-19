import { Edge, EdgeStorageStrategy } from './EdgeStorageStrategy';

// Bucket-based storage strategy. Each character is mapped into a bucket using a
// client-supplied function, which should be injective. The characters that this
// storage strategy supports may be limited, and it is up to the client to
// ensure that only supported characters are passed to operations exposed by
// this implementation.
export class BucketBasedEdgeStorageStrategy<T> implements EdgeStorageStrategy<T> {
	private readonly buckets: (T | undefined)[] = [];
	private _size = 0;
	private readonly charToBucketMapper: CharToBucketMapper;
	private readonly bucketToCharMapper: BucketToCharMapper;

	public constructor({ charToBucketMapper, bucketToCharMapper }: BucketEdgeStorageStrategyOptions) {
		this.charToBucketMapper = charToBucketMapper;
		this.bucketToCharMapper = bucketToCharMapper;
	}

	public set(char: number, node: T) {
		const index = this.charToBucketMapper(char);
		if (index >= this.buckets.length) {
			let diff = this.buckets.length - index + 1;
			while (diff-- > 0) this.buckets.push(undefined);
		}

		if (this.buckets[index] === undefined) this._size++; // only increment size if we're adding a new bucket
		this.buckets[index] = node;
	}

	public get(char: number) {
		const index = this.charToBucketMapper(char);
		if (index < this.buckets.length) return this.buckets[index];
	}

	public clear() {
		this._size = 0;
		this.buckets.splice(0);
	}

	public get size() {
		return this._size;
	}

	public *chars() {
		for (const edge of this) yield edge[0];
	}

	public *nodes() {
		for (const edge of this) yield edge[1];
	}

	public *[Symbol.iterator]() {
		for (let i = 0; i < this.buckets.length; i++) {
			const node = this.buckets[i];
			if (node !== undefined) {
				const char = this.bucketToCharMapper(i);
				yield [char, node] as Edge<T>;
			}
		}
	}
}

export interface BucketEdgeStorageStrategyOptions {
	charToBucketMapper: CharToBucketMapper;
	bucketToCharMapper: BucketToCharMapper;
}

export type CharToBucketMapper = (char: number) => number;

export type BucketToCharMapper = (bucket: number) => number;
