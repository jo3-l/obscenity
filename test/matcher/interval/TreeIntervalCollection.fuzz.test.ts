import * as fc from 'fast-check';

import { TreeIntervalCollection } from '../../../src/matcher/interval/TreeIntervalCollection';
import type { Interval } from '../../../src/util/Interval';

const arbitraryInterval = fc
	.tuple(fc.integer(-100, 100), fc.integer(-100, 100))
	.map<Interval>(([a, b]) => (a > b ? [b, a] : [a, b]));

test('calling fullyContains(interval) after inserting some intervals should have the same result as with the naive algorithm', () => {
	fc.assert(
		fc.property(fc.array(arbitraryInterval), arbitraryInterval, (intervals, target) => {
			const coll = new TreeIntervalCollection();
			let fullyContained = false;
			for (const interval of intervals) {
				fullyContained = fullyContained || (target[0] >= interval[0] && target[1] <= interval[1]);
				coll.insert(...interval);
			}
			expect(coll.fullyContains(...target)).toBe(fullyContained);
		}),
	);
});

test('after inserting some intervals, all inserted intervals should be stored in the tree', () => {
	fc.assert(
		fc.property(fc.array(arbitraryInterval), (intervals) => {
			const coll = new TreeIntervalCollection();
			for (const interval of intervals) coll.insert(...interval);
			expect([...coll]).toBePermutationOf(intervals);
		}),
	);
});
