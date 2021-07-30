export class CircularBuffer<T> implements Iterable<T> {
	private readonly data: (T | undefined)[];
	private head: number;
	private _length = 0;
	private mask: number;

	/**
	 * Creates a new circular buffer with the capacity set to the smallest power
	 * of 2 that is not less than the capacity passed.
	 *
	 * @param capacity - The capacity.
	 */
	public constructor(capacity: number) {
		this.head = 0;
		this.data = new Array<T>(nextHighestPowerOfTwo(capacity));
		this.mask = this.capacity - 1;
	}

	public push(value: T) {
		this.data[this.head + (this._length & this.mask)] = value;
		if (this._length === this.capacity) {
			this.head = (this.head + 1) & this.mask;
		} else {
			this._length++;
		}
	}

	public get(index: number) {
		if (index < 0 || index >= this._length) return undefined;
		return this.data[(this.head + index) & this.mask];
	}

	public clear() {
		this.head = 0;
		this._length = 0;
		this.data.fill(undefined);
	}

	public get capacity() {
		return this.data.length;
	}

	public get length() {
		return this._length;
	}

	public *[Symbol.iterator]() {
		for (let i = this.head; i < this.head + this._length; i++) {
			yield this.data[i & this.mask]!;
		}
	}
}

/**
 * @see https://graphics.stanford.edu/~seander/bithacks.html#RoundUpPowerOf2
 */
function nextHighestPowerOfTwo(v: number) {
	v--;
	v |= v >> 1;
	v |= v >> 2;
	v |= v >> 4;
	v |= v >> 8;
	v |= v >> 16;
	return ++v;
}
