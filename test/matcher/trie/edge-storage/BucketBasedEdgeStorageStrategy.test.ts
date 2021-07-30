import { BucketBasedEdgeStorageStrategy } from '../../../../src/matcher/trie/edge-storage/BucketBasedEdgeStorageStrategy';
import { CharacterCode } from '../../../../src/util/Char';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

const storage = new BucketBasedEdgeStorageStrategy<string>({
	charToBucketMapper: (c) => c - CharacterCode.LowerA,
	bucketToCharMapper: (b) => b + CharacterCode.LowerA,
});

afterEach(() => storage.clear());

describe('BucketBasedEdgeStorageStrategy#set()', () => {
	it('should add the edge', () => {
		storage.set('a'.charCodeAt(0), 'x');
		expectThatArrayIsPermutationOfOther([...storage], [['a'.charCodeAt(0), 'x']]);
		storage.set('b'.charCodeAt(0), 'y');
		expectThatArrayIsPermutationOfOther(
			[...storage],
			[
				['a'.charCodeAt(0), 'x'],
				['b'.charCodeAt(0), 'y'],
			],
		);
	});

	it('should overwrite existing edges', () => {
		storage.set('b'.charCodeAt(0), 'x');
		storage.set('b'.charCodeAt(0), 'y');
		expectThatArrayIsPermutationOfOther([...storage], [['b'.charCodeAt(0), 'y']]);
		expect(storage.size).toBe(1);
	});

	it('should increment the size', () => {
		storage.set('d'.charCodeAt(0), 'd');
		expect(storage.size).toBe(1);
		storage.set('e'.charCodeAt(0), 'e');
		expect(storage.size).toBe(2);
	});
});

describe('BucketBasedEdgeStorageStrategy#get()', () => {
	it('should return the node corresponding to the char', () => {
		storage.set('a'.charCodeAt(0), 'x');
		storage.set('e'.charCodeAt(0), 'y');
		storage.set('b'.charCodeAt(0), 'z');
		storage.set('z'.charCodeAt(0), 'a');
		expect(storage.get('a'.charCodeAt(0))).toBe('x');
		expect(storage.get('e'.charCodeAt(0))).toBe('y');
		expect(storage.get('b'.charCodeAt(0))).toBe('z');
		expect(storage.get('z'.charCodeAt(0))).toBe('a');
	});

	it('should return undefined if there is no node corresponding to the char', () => {
		storage.set('d'.charCodeAt(0), 'y');
		storage.set('y'.charCodeAt(0), 'h');
		storage.set('b'.charCodeAt(0), 'b');
		expect(storage.get('e'.charCodeAt(0))).toBeUndefined();
		expect(storage.get('c'.charCodeAt(0))).toBeUndefined();
		expect(storage.get('z'.charCodeAt(0))).toBeUndefined();
	});
});

describe('BucketBasedEdgeStorageStrategy#clear()', () => {
	it('should clear the storage', () => {
		storage.set('d'.charCodeAt(0), 'hi');
		expect(storage.size).toBe(1);
		storage.clear();
		expect(storage.size).toBe(0);
	});
});

describe('BucketBasedEdgeStorageStrategy#size', () => {
	it('should reflect the number of edges', () => {
		expect(storage.size).toBe(0);
		storage.set('p'.charCodeAt(0), 'a');
		expect(storage.size).toBe(1);
	});
});

describe('BucketBasedEdgeStorageStrategy#chars()', () => {
	it('should return an iterator over the labels (chars) of the edges', () => {
		storage.set('a'.charCodeAt(0), 'a');
		storage.set('p'.charCodeAt(0), 'b');
		storage.set('y'.charCodeAt(0), 'c');
		expectThatArrayIsPermutationOfOther(
			[...storage.chars()],
			['a'.charCodeAt(0), 'p'.charCodeAt(0), 'y'.charCodeAt(0)],
		);
	});
});

describe('BucketBasedEdgeStorageStrategy#nodes()', () => {
	it('should return an iterator over the nodes that the edges point to', () => {
		storage.set('b'.charCodeAt(0), 'b');
		storage.set('e'.charCodeAt(0), 'c');
		storage.set('z'.charCodeAt(0), 'd');
		expectThatArrayIsPermutationOfOther([...storage.nodes()], ['b', 'c', 'd']);
	});
});

it('should be iterable', () => {
	storage.set('e'.charCodeAt(0), 'a');
	storage.set('d'.charCodeAt(0), 'd');
	storage.set('m'.charCodeAt(0), 'e');
	expectThatArrayIsPermutationOfOther(
		[...storage],
		[
			['e'.charCodeAt(0), 'a'],
			['d'.charCodeAt(0), 'd'],
			['m'.charCodeAt(0), 'e'],
		],
	);
});
