import type { Interval } from '../../../../src/matcher/interval/Interval';
import { TreeBasedIntervalStorageStrategy } from '../../../../src/matcher/interval/storage/TreeBasedIntervalStorageStrategy';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

let storage: TreeBasedIntervalStorageStrategy;

beforeEach(() => {
	storage = new TreeBasedIntervalStorageStrategy();
});

describe('TreeBasedIntervalStorageStrategy#insert()', () => {
	it('should add the specified interval', () => {
		storage.insert([5, 10]);
		expectThatArrayIsPermutationOfOther([...storage.values()], [[5, 10]]);
		storage.insert([7, 15]);
		expectThatArrayIsPermutationOfOther(
			[...storage.values()],
			[
				[5, 10],
				[7, 15],
			],
		);
		storage.insert([3, 5]);
		expectThatArrayIsPermutationOfOther(
			[...storage.values()],
			[
				[3, 5],
				[5, 10],
				[7, 15],
			],
		);
		storage.insert([500, 1000]);
		expectThatArrayIsPermutationOfOther(
			[...storage.values()],
			[
				[3, 5],
				[5, 10],
				[7, 15],
				[500, 1000],
			],
		);
		storage.insert([0, 2]);
		expectThatArrayIsPermutationOfOther(
			[...storage.values()],
			[
				[0, 2],
				[3, 5],
				[5, 10],
				[7, 15],
				[500, 1000],
			],
		);
	});

	it('should increment the size', () => {
		storage.insert([5, 10]);
		expect(storage.size).toBe(1);
		storage.insert([3, 4]);
		expect(storage.size).toBe(2);
	});
});

describe('TreeBasedIntervalStorageStrategy#fullyContains()', () => {
	it('should return false if there are no values', () => {
		expect(storage.fullyContains([10, 15])).toBeFalsy();
	});

	it('should return false if the interval is not fully contained', () => {
		const interval: Interval = [5, 10];
		storage.insert([3, 7]);
		expect(storage.fullyContains(interval)).toBeFalsy();
		storage.insert([6, 10]);
		expect(storage.fullyContains(interval)).toBeFalsy();
		storage.insert([7, 11]);
		expect(storage.fullyContains(interval)).toBeFalsy();
	});

	it('should return true if there is an interval that fully contains it', () => {
		const interval: Interval = [5, 10];
		storage.insert([7, 11]);
		storage.insert([6, 10]);
		storage.insert([5, 15]);
		expect(storage.fullyContains(interval)).toBeTruthy();
	});

	it('should return true if there is an interval that is equal to it', () => {
		const interval: Interval = [5, 10];
		storage.insert([2, 3]);
		storage.insert([3, 4]);
		storage.insert([4, 5]);
		storage.insert([5, 10]);
		expect(storage.fullyContains(interval)).toBeTruthy();
	});
});

describe('TreeBasedIntervalStorageStrategy#values()', () => {
	it('should return an empty iterator if there are no values', () => {
		const it = storage.values();
		expect(it.next().done).toBeTruthy();
		expect(it[Symbol.iterator]()).toStrictEqual(it);
	});
});

it('should be iterable', () => {
	storage.insert([5, 10]);
	storage.insert([10, 15]);
	storage.insert([100, 500]);
	expectThatArrayIsPermutationOfOther(
		[...storage],
		[
			[5, 10],
			[10, 15],
			[100, 500],
		],
	);
});
