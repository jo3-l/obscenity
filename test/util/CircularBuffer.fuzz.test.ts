import * as fc from 'fast-check';

import { CircularBuffer } from '../../src/util/CircularBuffer';

test('adding the elements of an array a of size > 0 in a sliding window fashion to a circular buffer should cause it to hold the values in the current window', () => {
	fc.assert(
		fc.property(
			fc
				.array(fc.integer())
				.filter((data) => data.length > 0)
				.chain((data) => {
					const maxCapacity = Math.floor(Math.log2(data.length));
					return fc.tuple(
						fc.constant(data),
						fc.integer(0, maxCapacity).map((n) => 1 << n),
					);
				}),
			([data, capacity]) => {
				const buf = new CircularBuffer(capacity);
				for (let i = 0; i < capacity; i++) buf.push(data[i]);
				expect([...buf]).toStrictEqual(data.slice(0, capacity));
				for (let l = 1, r = capacity; r < data.length; l++, r++) {
					buf.push(data[r]);
					expect([...buf]).toStrictEqual(data.slice(l, r + 1));
				}
			},
		),
	);
});
