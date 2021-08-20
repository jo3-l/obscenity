import * as fc from 'fast-check';

import { TreeBasedIntervalStorageStrategy } from '../../../../src/matcher/interval/storage/TreeBasedIntervalStorageStrategy';

const arbitraryInterval = fc
	.tuple(fc.integer(-100, 100), fc.integer(-100, 100))
	.map<[number, number]>(([a, b]) => (a > b ? [b, a] : [a, b]));

test('calling fullyContains(interval) after inserting some intervals should have the same result as with the naive algorithm', () => {
	fc.assert(
		fc.property(fc.array(arbitraryInterval), arbitraryInterval, (intervals, target) => {
			const storage = new TreeBasedIntervalStorageStrategy();
			let fullyContained = false;
			for (const interval of intervals) {
				fullyContained = fullyContained || (target[0] >= interval[0] && target[1] <= interval[1]);
				storage.insert(interval);
			}
			expect(storage.fullyContains(target)).toBe(fullyContained);
		}),
	);
});

test('after inserting some intervals, all inserted intervals should be stored in the tree', () => {
	fc.assert(
		fc.property(fc.array(arbitraryInterval), (intervals) => {
			const storage = new TreeBasedIntervalStorageStrategy();
			for (const interval of intervals) storage.insert(interval);
			expect([...storage]).toBePermutationOf(intervals);
		}),
	);
});
