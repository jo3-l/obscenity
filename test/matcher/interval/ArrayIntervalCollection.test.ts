import { ArrayIntervalCollection } from '../../../src/matcher/interval/ArrayIntervalCollection';

let coll: ArrayIntervalCollection;

beforeEach(() => {
	coll = new ArrayIntervalCollection();
});

describe('ArrayBasedIntervalStorageStrategy#insert()', () => {
	it('should insert the specified interval into the storage', () => {
		coll.insert(100, 200);
		expect([...coll.values()]).toStrictEqual([[100, 200]]);
		coll.insert(500, 1000);
		expect([...coll.values()]).toStrictEqual([
			[100, 200],
			[500, 1000],
		]);
	});

	it('should increment the size', () => {
		coll.insert(5, 10);
		expect(coll.size).toBe(1);
		coll.insert(2, 5);
		expect(coll.size).toBe(2);
	});
});

describe('ArrayBasedIntervalStorage#fullyContains()', () => {
	it('should return false if the interval is only partially overlapping', () => {
		coll.insert(0, 150);
		expect(coll.fullyContains(100, 200)).toBeFalsy();
		coll.insert(150, 250);
		expect(coll.fullyContains(100, 200)).toBeFalsy();
	});

	it('should return true only if the interval is fully contained', () => {
		coll.insert(5, 11);
		expect(coll.fullyContains(5, 10)).toBeTruthy();
	});

	it('should return true if there an interval that is equal', () => {
		coll.insert(3, 5);
		coll.insert(5, 10);
		expect(coll.fullyContains(5, 10)).toBeTruthy();
	});
});

it('should be iterable', () => {
	coll.insert(5, 10);
	coll.insert(10, 15);
	coll.insert(50, 100);
	expect([...coll]).toStrictEqual([
		[5, 10],
		[10, 15],
		[50, 100],
	]);
});
