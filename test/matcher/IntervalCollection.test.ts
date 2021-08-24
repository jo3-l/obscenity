import { IntervalCollection } from '../../src/matcher/IntervalCollection';
import type { Interval } from '../../src/util/Interval';

let coll: IntervalCollection;

beforeEach(() => {
	coll = new IntervalCollection();
});

describe('IntervalCollection#insert()', () => {
	it('should add the interval to the collection', () => {
		coll.insert(5, 10);
		expect([...coll]).toBePermutationOf([[5, 10]]);
		coll.insert(12, 13);
		expect([...coll]).toBePermutationOf([
			[12, 13],
			[5, 10],
		]);
	});
});

describe('IntervalCollection#query()', () => {
	it('should return false if the input interval does not intersect any of the stored intervals', () => {
		coll.insert(5, 10);
		coll.insert(13, 14);
		coll.insert(17, 19);
		expect(coll.query(3, 4)).toBeFalsy();
	});

	it('should return false if the interval collection is empty', () => {
		expect(coll.query(0, 0)).toBeFalsy();
	});

	it('should return true if there is some interval stored that such that the input interval is a subset of it', () => {
		coll.insert(8, 9);
		coll.insert(10, 12);
		coll.insert(13, 17);
		expect(coll.query(14, 15)).toBeTruthy();
	});

	it('should return false if the input interval simply overlaps with some of the stored intervals', () => {
		coll.insert(17, 19);
		coll.insert(20, 24);
		coll.insert(25, 44);
		expect(coll.query(34, 45)).toBeFalsy();
	});
});

it('should be iterable', () => {
	coll.insert(30, 35);
	coll.insert(47, 49);
	coll.insert(98, 99);

	const acc: Interval[] = [];
	for (const interval of coll) acc.push(interval);
	expect(acc).toBePermutationOf([
		[30, 35],
		[47, 49],
		[98, 99],
	]);
});
