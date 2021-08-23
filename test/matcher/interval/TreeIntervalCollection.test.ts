import { TreeIntervalCollection } from '../../../src/matcher/interval/TreeIntervalCollection';

let storage: TreeIntervalCollection;

beforeEach(() => {
	storage = new TreeIntervalCollection();
});

describe('TreeBasedIntervalStorageStrategy#insert()', () => {
	it('should add the specified interval', () => {
		storage.insert(5, 10);
		expect([...storage.values()]).toBePermutationOf([[5, 10]]);
		storage.insert(7, 15);
		expect([...storage.values()]).toBePermutationOf([
			[5, 10],
			[7, 15],
		]);
		storage.insert(3, 5);
		expect([...storage.values()]).toBePermutationOf([
			[3, 5],
			[5, 10],
			[7, 15],
		]);
		storage.insert(500, 1000);
		expect([...storage.values()]).toBePermutationOf([
			[3, 5],
			[5, 10],
			[7, 15],
			[500, 1000],
		]);
		storage.insert(0, 2);
		expect([...storage.values()]).toBePermutationOf([
			[0, 2],
			[3, 5],
			[5, 10],
			[7, 15],
			[500, 1000],
		]);
	});

	it('should increment the size', () => {
		storage.insert(5, 10);
		expect(storage.size).toBe(1);
		storage.insert(3, 4);
		expect(storage.size).toBe(2);
	});
});

describe('TreeBasedIntervalStorageStrategy#fullyContains()', () => {
	it('should return false if there are no values', () => {
		expect(storage.fullyContains(10, 15)).toBeFalsy();
	});

	it('should return false if the interval is not fully contained', () => {
		storage.insert(3, 7);
		expect(storage.fullyContains(5, 10)).toBeFalsy();
		storage.insert(6, 10);
		expect(storage.fullyContains(5, 10)).toBeFalsy();
		storage.insert(7, 11);
		expect(storage.fullyContains(5, 10)).toBeFalsy();
	});

	it('should return true if there is an interval that fully contains it', () => {
		storage.insert(7, 11);
		storage.insert(6, 10);
		storage.insert(5, 15);
		expect(storage.fullyContains(5, 10)).toBeTruthy();
	});

	it('should return true if there is an interval that is equal to it', () => {
		storage.insert(2, 3);
		storage.insert(3, 4);
		storage.insert(4, 5);
		storage.insert(5, 10);
		expect(storage.fullyContains(5, 10)).toBeTruthy();
	});
});

it('should be iterable', () => {
	storage.insert(5, 10);
	storage.insert(10, 15);
	storage.insert(100, 500);
	expect([...storage]).toBePermutationOf([
		[5, 10],
		[10, 15],
		[100, 500],
	]);
});