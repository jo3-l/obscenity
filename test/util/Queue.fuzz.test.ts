import * as fc from 'fast-check';

import { Queue } from '../../src/util/Queue';

test('after a series of pushes, popping should produce the input elements in reverse order', () => {
	fc.assert(
		fc.property(fc.array(fc.integer()), (data) => {
			const queue = new Queue();
			for (const v of data) queue.push(v);

			let j = 0;
			while (queue.length > 0) expect(queue.shift()).toBe(data[j++]);
		}),
	);
});

test('after a series of pushes, the length of the queue should be equal to the number of elements pushed', () => {
	fc.assert(
		fc.property(fc.array(fc.integer()), (data) => {
			const queue = new Queue();
			for (let i = 0; i < data.length; i++) {
				queue.push(data[i]);
				expect(queue).toHaveLength(i + 1);
			}
		}),
	);
});
