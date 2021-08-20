import { ArrayBasedEdgeStorageStrategy } from '../../../../src/matcher/trie/edge-storage/ArrayBasedEdgeStorageStrategy';

const storage = new ArrayBasedEdgeStorageStrategy<string>();

afterEach(() => storage.clear());

describe('ArrayBasedEdgeStorageStrategy#set()', () => {
	it('should add the edge', () => {
		storage.set(5, 'x');
		expect([...storage]).toBePermutationOf([[5, 'x']]);
		storage.set(8, 'y');
		expect([...storage]).toBePermutationOf([
			[5, 'x'],
			[8, 'y'],
		]);
	});

	it('should overwrite existing edges', () => {
		storage.set(5, 'x');
		storage.set(5, 'y');
		expect([...storage]).toBePermutationOf([[5, 'y']]);
		expect(storage.size).toBe(1);
	});

	it('should increment the size', () => {
		storage.set(8, 'd');
		expect(storage.size).toBe(1);
		storage.set(9, 'e');
		expect(storage.size).toBe(2);
	});
});

describe('ArrayBasedEdgeStorageStrategy#get()', () => {
	it('should return the node corresponding to the char (low num of edges)', () => {
		storage.set(9, 'x');
		storage.set(15, 'y');
		expect(storage.get(9)).toBe('x');
		expect(storage.get(15)).toBe('y');
	});

	it('should return the node corresponding to the char (high num of edges)', () => {
		storage.set(10, 'x');
		storage.set(1, 'y');
		storage.set(5, 'z');
		storage.set(7, 'a');
		expect(storage.get(10)).toBe('x');
		expect(storage.get(1)).toBe('y');
		expect(storage.get(5)).toBe('z');
		expect(storage.get(7)).toBe('a');
	});

	it('should return undefined if there is no node corresponding to the char (low num of edges)', () => {
		storage.set(8, 'x');
		storage.set(10, 'y');
		expect(storage.get(9)).toBeUndefined();
	});

	it('should return undefined if there is no node corresponding to the char (high num of edges)', () => {
		storage.set(15, 'd');
		storage.set(60, 'y');
		storage.set(35, 'h');
		storage.set(50, 'b');
		expect(storage.get(57)).toBeUndefined();
		expect(storage.get(34)).toBeUndefined();
	});
});

describe('ArrayBasedEdgeStorageStrategy#clear()', () => {
	it('should clear the storage', () => {
		storage.set(5, 'hi');
		expect(storage.size).toBe(1);
		storage.clear();
		expect(storage.size).toBe(0);
	});
});

describe('ArrayBasedEdgeStorageStrategy#size', () => {
	it('should reflect the number of edges', () => {
		expect(storage.size).toBe(0);
		storage.set(10, 'a');
		expect(storage.size).toBe(1);
	});
});

describe('ArrayBasedEdgeStorageStrategy#chars()', () => {
	it('should return an iterator over the labels (chars) of the edges', () => {
		storage.set(5, 'a');
		storage.set(8, 'b');
		storage.set(4, 'c');
		expect([...storage.chars()]).toBePermutationOf([5, 8, 4]);
	});
});

describe('ArrayBasedEdgeStorageStrategy#nodes()', () => {
	it('should return an iterator over the nodes that the edges point to', () => {
		storage.set(5, 'b');
		storage.set(6, 'c');
		storage.set(7, 'd');
		expect([...storage.nodes()]).toBePermutationOf(['b', 'c', 'd']);
	});
});

it('should be iterable', () => {
	storage.set(8, 'a');
	storage.set(50, 'd');
	storage.set(4, 'e');
	expect([...storage]).toBePermutationOf([
		[8, 'a'],
		[50, 'd'],
		[4, 'e'],
	]);
});
