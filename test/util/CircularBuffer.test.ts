import { CircularBuffer } from '../../src/util/CircularBuffer';

describe('constructor', () => {
	it('should set the capacity to the nearest power of 2 (not a power of 2)', () => {
		const buf = new CircularBuffer(5);
		expect(buf.capacity).toBe(8);
	});

	it('should set the capacity to the nearest power of 2 (exact power of 2)', () => {
		const buf = new CircularBuffer(4);
		expect(buf.capacity).toBe(4);
	});

	it('should set the length to 0', () => {
		const buf = new CircularBuffer(5);
		expect(buf).toHaveLength(0);
	});
});

describe('CircularBuffer#push()', () => {
	it('should add the element at the back (no overflow)', () => {
		const buf = new CircularBuffer(8);
		buf.push(5);
		expect(buf).toHaveLength(1);
		expect(buf.get(0)).toBe(5);
	});

	it('should add the element at the back and remove the element at the front (overflow)', () => {
		const buf = new CircularBuffer(4);
		buf.push(5);
		buf.push(6);
		buf.push(7);
		buf.push(8);
		buf.push(9);
		expect(buf).toHaveLength(4);
		expect(buf.get(3)).toBe(9);
		expect(buf.get(2)).toBe(8);
		expect(buf.get(1)).toBe(7);
		expect(buf.get(0)).toBe(6);
	});
});

describe('CircularBuffer#get()', () => {
	it('should get the element at the offset provided (head at 0)', () => {
		const buf = new CircularBuffer(4);
		buf.push(1);
		buf.push(2);
		expect(buf.get(1)).toBe(2);
	});

	it('should get the element at the offset provided (head not at 0)', () => {
		const buf = new CircularBuffer(4);
		for (let i = 1; i <= 10; i++) buf.push(i);
		expect(buf.get(3)).toBe(10);
		expect(buf.get(2)).toBe(9);
	});

	it('should return undefined for values out of range', () => {
		const buf = new CircularBuffer(4);
		expect(buf.get(0)).toBeUndefined();
		expect(buf.get(-1)).toBeUndefined();
		expect(buf.get(500)).toBeUndefined();
	});
});

describe('CircularBuffer#clear()', () => {
	it('should clear the underlying array', () => {
		const buf = new CircularBuffer(4);
		buf.push(3);
		buf.push(4);
		buf.clear();
		expect(buf.get(0)).toBeUndefined();
	});

	it('should set the length to 0', () => {
		const buf = new CircularBuffer(4);
		buf.push(3);
		buf.push(4);
		buf.clear();
		expect(buf).toHaveLength(0);
	});
});

describe('CircularBuffer#capacity', () => {
	it('should reflect the capacity of the circular buffer (rounded up to nearest power of 2)', () => {
		const buf = new CircularBuffer(5);
		expect(buf.capacity).toBe(8);
	});

	it('should reflect the capacity of the circular buffer (exact power of 2 provided)', () => {
		const buf = new CircularBuffer(2);
		expect(buf.capacity).toBe(2);
	});
});

describe('CircularBuffer#length', () => {
	it('should start at 0', () => {
		const buf = new CircularBuffer(5);
		expect(buf).toHaveLength(0);
	});

	it('should grow as the circular buffer grows', () => {
		const buf = new CircularBuffer(5);
		buf.push(5);
		buf.push(7);
		expect(buf).toHaveLength(2);
	});

	it('should stay the same if capacity is hit', () => {
		const buf = new CircularBuffer(4);
		buf.push(1);
		buf.push(2);
		buf.push(3);
		buf.push(4);
		expect(buf).toHaveLength(4);
		buf.push(5);
		expect(buf).toHaveLength(4);
	});
});

describe('iterating over it', () => {
	it('should be iterable and only return elements in range', () => {
		const buf = new CircularBuffer<number>(4);
		buf.push(1);
		buf.push(2);

		const collected: number[] = [];
		for (const elem of buf) collected.push(elem);
		expect(collected).toStrictEqual([1, 2]);
	});
});
