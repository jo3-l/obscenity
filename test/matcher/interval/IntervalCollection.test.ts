import { Interval } from '../../../src/matcher/interval/Interval';
import { IntervalCollection } from '../../../src/matcher/interval/IntervalCollection';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

let coll: IntervalCollection;

beforeEach(() => {
	coll = new IntervalCollection();
});

const intervals: Interval[] = [
	[2, 40],
	[4, 300],
	[45, 50],
	[65, 600],
	[79, 500],
	[880, 8458],
	[696, 955],
	[697, 7777],
	[559, 4949],
];

describe('IntervalCollection#insert()', () => {
	it('should insert the specified interval into the storage', () => {
		coll.insert([100, 200]);
		expect([...coll.values()]).toStrictEqual([[100, 200]]);
		coll.insert([500, 1000]);
		expect([...coll.values()]).toStrictEqual([
			[100, 200],
			[500, 1000],
		]);
	});

	it('should increment the size', () => {
		coll.insert([5, 10]);
		expect(coll.size).toBe(1);
		coll.insert([2, 5]);
		expect(coll.size).toBe(2);
	});

	describe('dynamic strategy switching', () => {
		it('should work correctly when adding >10 intervals (switch to tree-based)', () => {
			for (const interval of intervals) coll.insert(interval);
			expectThatArrayIsPermutationOfOther([...coll], intervals);
			coll.insert([55, 506]);
			expectThatArrayIsPermutationOfOther([...coll], [...intervals, [55, 506]]);
			coll.insert([599, 600]);
			expectThatArrayIsPermutationOfOther([...coll], [...intervals, [55, 506], [599, 600]]);
		});
	});
});

describe('IntervalCollection#fullyContains()', () => {
	it('should return false if the interval is only partially overlapping', () => {
		const interval: Interval = [100, 200];
		coll.insert([0, 150]);
		expect(coll.fullyContains(interval)).toBeFalsy();
		coll.insert([150, 250]);
		expect(coll.fullyContains(interval)).toBeFalsy();
	});

	it('should return true only if the interval is fully contained', () => {
		const interval: Interval = [5, 10];
		coll.insert([5, 11]);
		expect(coll.fullyContains(interval)).toBeTruthy();
	});

	it('should return true if there an interval that is equal', () => {
		const interval: Interval = [5, 10];
		coll.insert([3, 5]);
		coll.insert([5, 10]);
		expect(coll.fullyContains(interval)).toBeTruthy();
	});
});

it('should be iterable', () => {
	coll.insert([5, 10]);
	coll.insert([10, 15]);
	coll.insert([50, 100]);
	expect([...coll]).toStrictEqual([
		[5, 10],
		[10, 15],
		[50, 100],
	]);
});
