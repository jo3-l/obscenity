import { Queue } from '../../src/util/Queue';

describe('constructor', () => {
	it('should set the initial capacity to 4', () => {
		expect(new Queue().capacity).toBe(4);
	});
});

describe('Queue#push()', () => {
	it('should add elements to the queue in FIFO order', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		expect(queue.shift()).toBe(1);
		expect(queue.shift()).toBe(2);
	});

	it('should grow the queue if needed (head = 0)', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		queue.push(3);
		queue.push(4);
		expect(queue.capacity).toBe(8);
		expect(queue.shift()).toBe(1);
		queue.push(5);
	});

	it('should grow the queue if needed (head != 0)', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		queue.shift();
		queue.push(3);
		queue.push(4);
		queue.push(5);
		expect(queue.capacity).toBe(8);
		expect(queue.shift()).toBe(2);
	});

	it('should increase the length of the queue', () => {
		const queue = new Queue();
		queue.push(1);
		expect(queue).toHaveLength(1);
	});
});

describe('Queue#shift()', () => {
	it('should return undefined for empty elements', () => {
		const queue = new Queue();
		expect(queue.shift()).toBeUndefined();
	});

	it('should return the first element added', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		queue.push(3);
		queue.push(4);
		queue.push(5);
		queue.push(6);
		expect(queue.shift()).toBe(1);
		expect(queue.shift()).toBe(2);
	});

	it('should decrease the length of the queue if an element was removed', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		expect(queue).toHaveLength(2);
		queue.shift();
		expect(queue).toHaveLength(1);
	});

	it('should not decrease the length of the queue if it was empty before', () => {
		const queue = new Queue();
		queue.shift();
		expect(queue).toHaveLength(0);
	});
});

describe('Queue#length', () => {
	it('should start at 0', () => {
		const queue = new Queue();
		expect(queue).toHaveLength(0);
	});

	it('should be the size of the queue', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		expect(queue).toHaveLength(2);
	});

	it('should be the size of the queue when head > tail', () => {
		const queue = new Queue();
		queue.push(1);
		queue.push(2);
		queue.push(3);
		queue.shift();
		queue.shift();
		queue.push(4);
		queue.push(5);
		expect(queue).toHaveLength(3);
	});
});
