import { CharacterCode } from '../../../../util/Char';
import type { Edge, EdgeCollection } from './EdgeCollection';

export class BucketEdgeCollection<T> implements EdgeCollection<T> {
	private _size = 0;
	private buckets = new Array<T | undefined>(26);

	public set(char: number, node: T) {
		const k = char - CharacterCode.LowerA;
		// Only increment the size if we didn't already have a node corresponding to it.
		if (!this.buckets[k]) this._size++;
		this.buckets[k] = node;
	}

	public get(char: number) {
		const k = char - CharacterCode.LowerA;
		if (k >= 0 && k < 26) return this.buckets[k];
	}

	public get size() {
		return this._size;
	}

	public *keys() {
		for (let i = 0; i < 26; i++) {
			if (this.buckets[i] !== undefined) yield i + CharacterCode.LowerA;
		}
	}

	public *values() {
		for (let i = 0; i < 26; i++) {
			if (this.buckets[i] !== undefined) yield this.buckets[i]!;
		}
	}

	public *[Symbol.iterator]() {
		for (let i = 0; i < 26; i++) {
			if (this.buckets[i] !== undefined) yield [i + CharacterCode.LowerA, this.buckets[i]] as Edge<T>;
		}
	}
}
