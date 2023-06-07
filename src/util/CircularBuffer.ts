export class CircularBuffer<T> implements Iterable<T> {
	private readonly data: (T | undefined)[];

	private head: number;

	private _length = 0;

	private readonly mask: number;

	// Note: calling this constructor with a certain capacity does not guarantee that
	// the circular buffer's capacity will be exactly that value. It is only guaranteed
	// that the circular buffer can store at least that capacity.
	public constructor(capacity: number) {
		this.head = 0;
		// Round up to the nearest higher power of two.
		this.data = Array.from({ length: 1 << Math.ceil(Math.log2(capacity)) });
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

	public set(index: number, value: T) {
		this.data[(this.head + index) & this.mask] = value;
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
