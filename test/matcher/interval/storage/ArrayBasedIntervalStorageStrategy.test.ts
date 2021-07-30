import { Interval } from '../../../../src/matcher/interval/Interval';
import { ArrayBasedIntervalStorageStrategy } from '../../../../src/matcher/interval/storage/ArrayBasedIntervalStorageStrategy';

let storage: ArrayBasedIntervalStorageStrategy;

beforeEach(() => {
	storage = new ArrayBasedIntervalStorageStrategy();
});

describe('ArrayBasedIntervalStorageStrategy#insert()', () => {
	it('should insert the specified interval into the storage', () => {
		storage.insert([100, 200]);
		expect([...storage.values()]).toStrictEqual([[100, 200]]);
		storage.insert([500, 1000]);
		expect([...storage.values()]).toStrictEqual([
			[100, 200],
			[500, 1000],
		]);
	});

	it('should increment the size', () => {
		storage.insert([5, 10]);
		expect(storage.size).toBe(1);
		storage.insert([2, 5]);
		expect(storage.size).toBe(2);
	});
});

describe('ArrayBasedIntervalStorage#fullyContains()', () => {
	it('should return false if the interval is only partially overlapping', () => {
		const interval: Interval = [100, 200];
		storage.insert([0, 150]);
		expect(storage.fullyContains(interval)).toBeFalsy();
		storage.insert([150, 250]);
		expect(storage.fullyContains(interval)).toBeFalsy();
	});

	it('should return true only if the interval is fully contained', () => {
		const interval: Interval = [5, 10];
		storage.insert([5, 11]);
		expect(storage.fullyContains(interval)).toBeTruthy();
	});

	it('should return true if there an interval that is equal', () => {
		const interval: Interval = [5, 10];
		storage.insert([3, 5]);
		storage.insert([5, 10]);
		expect(storage.fullyContains(interval)).toBeTruthy();
	});
});

it('should be iterable', () => {
	storage.insert([5, 10]);
	storage.insert([10, 15]);
	storage.insert([50, 100]);
	expect([...storage]).toStrictEqual([
		[5, 10],
		[10, 15],
		[50, 100],
	]);
});
