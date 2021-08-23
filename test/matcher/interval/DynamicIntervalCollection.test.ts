import { ArrayIntervalCollection } from '../../../src/matcher/interval/ArrayIntervalCollection';
import { DynamicIntervalCollection } from '../../../src/matcher/interval/DynamicIntervalCollection';
import { TreeIntervalCollection } from '../../../src/matcher/interval/TreeIntervalCollection';
import type { Interval } from '../../../src/util/Interval';

let coll: DynamicIntervalCollection;

beforeEach(() => {
	coll = new DynamicIntervalCollection();
});

afterEach(() => {
	jest.restoreAllMocks();
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
	[595, 858],
];

function insertTenIntervals() {
	for (const interval of intervals) coll.insert(...interval);
}

describe('DynamicIntervalCollection#insert()', () => {
	it('should forward the call to the array implementation if size < 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'insert');
		coll.insert(3, 4);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(3, 4);
	});

	it('should transfer existing intervals to the tree implementation when size hits 10', () => {
		const spy = jest.spyOn(TreeIntervalCollection.prototype, 'insert');
		insertTenIntervals();
		expect(spy).toHaveBeenCalledTimes(10);
		expect(spy.mock.calls).toBePermutationOf(intervals);
	});

	it('should forward the call to the tree implementation when size > 10', () => {
		const spy = jest.spyOn(TreeIntervalCollection.prototype, 'insert');
		insertTenIntervals();
		coll.insert(8, 9);
		expect(spy).toHaveBeenLastCalledWith(8, 9);
	});
});

describe('DynamicIntervalCollection#fullyContains()', () => {
	it('should forward the call to the array implementation if size < 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'fullyContains');
		coll.fullyContains(7, 8);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(7, 8);
	});

	it('should forward the call to the tree implementation if size >= 10', () => {
		const spy = jest.spyOn(TreeIntervalCollection.prototype, 'fullyContains');
		insertTenIntervals();
		coll.fullyContains(9, 10);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(9, 10);
	});
});

describe('DynamicIntervalCollection#values()', () => {
	it('should forward the call to the array implementation if size < 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'values');
		coll.values();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should forward the call to the tree implementation if size >= 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'values');
		insertTenIntervals();
		coll.values();
		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('DynamicIntervalCollection[Symbol.iterator]', () => {
	it('should call values() on the array implementation if size < 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'values');
		coll[Symbol.iterator]();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should call values() on the tree implementation if size >= 10', () => {
		const spy = jest.spyOn(TreeIntervalCollection.prototype, 'values');
		insertTenIntervals();
		coll[Symbol.iterator]();
		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('DynamicIntervalCollection#size', () => {
	it('should access size on the array implementation if size < 10', () => {
		const spy = jest.spyOn(ArrayIntervalCollection.prototype, 'size', 'get');
		coll.size;
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should access size on the tree implementation if size >= 10', () => {
		const spy = jest.spyOn(TreeIntervalCollection.prototype, 'size', 'get');
		insertTenIntervals();
		coll.size;
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
