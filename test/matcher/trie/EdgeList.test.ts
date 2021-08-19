import type { Edge } from '../../../src/matcher/trie/edge-storage/EdgeStorageStrategy';
import { EdgeList } from '../../../src/matcher/trie/EdgeList';
import { CharacterCode } from '../../../src/util/Char';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

const list = new EdgeList<string>();

afterEach(() => list.clear());

const edges: Edge<string>[] = [...new Array(26).keys()]
	// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
	.map((n) => CharacterCode.LowerA + n)
	.map((c) => [c, 'something']);

describe('EdgeList#set()', () => {
	it('should add the edge', () => {
		list.set(5, 'x');
		expectThatArrayIsPermutationOfOther([...list], [[5, 'x']]);
		list.set(8, 'y');
		expectThatArrayIsPermutationOfOther(
			[...list],
			[
				[5, 'x'],
				[8, 'y'],
			],
		);
	});

	it('should overwrite existing edges', () => {
		list.set(5, 'x');
		list.set(5, 'y');
		expectThatArrayIsPermutationOfOther([...list], [[5, 'y']]);
		expect(list.size).toBe(1);
	});

	it('should increment the size', () => {
		list.set(8, 'd');
		expect(list.size).toBe(1);
		list.set(9, 'e');
		expect(list.size).toBe(2);
	});

	describe('dynamic strategy switching', () => {
		it('should work correctly when adding >10 and <=26 edges (all lowercase ascii) (bucket-based)', () => {
			for (const e of edges.slice(0, 15)) list.set(...e);
			expectThatArrayIsPermutationOfOther([...list], edges.slice(0, 15));
		});

		it('should work correctly when adding >10 and <=26 edges (some non-lowercase ascii) (map-based)', () => {
			const subset = edges.slice(0, 16);
			subset.push([5, 'd']);
			for (const e of subset) list.set(...e);
			expectThatArrayIsPermutationOfOther([...list], subset);
		});

		it('should work correctly when adding >26 edges (map-based)', () => {
			const subset = [...edges];
			subset.push([3, 'h']);
			subset.push([4, 'd']);
			subset.push([150, 'z']);
			subset.push([202, 'd']);
			for (const e of subset) list.set(...e);
			expectThatArrayIsPermutationOfOther([...list], subset);
		});
	});
});

describe('EdgeList#get()', () => {
	it('should return the node corresponding to the char (low num of edges)', () => {
		list.set(9, 'x');
		list.set(15, 'y');
		expect(list.get(9)).toBe('x');
		expect(list.get(15)).toBe('y');
	});

	it('should return the node corresponding to the char (high num of edges)', () => {
		list.set(10, 'x');
		list.set(1, 'y');
		list.set(5, 'z');
		list.set(7, 'a');
		expect(list.get(10)).toBe('x');
		expect(list.get(1)).toBe('y');
		expect(list.get(5)).toBe('z');
		expect(list.get(7)).toBe('a');
	});

	it('should return undefined if there is no node corresponding to the char (low num of edges)', () => {
		list.set(8, 'x');
		list.set(10, 'y');
		expect(list.get(9)).toBeUndefined();
	});

	it('should return undefined if there is no node corresponding to the char (high num of edges)', () => {
		list.set(15, 'd');
		list.set(60, 'y');
		list.set(35, 'h');
		list.set(50, 'b');
		expect(list.get(57)).toBeUndefined();
		expect(list.get(34)).toBeUndefined();
	});
});

describe('EdgeList#clear()', () => {
	it('should clear the list', () => {
		list.set(5, 'hi');
		expect(list.size).toBe(1);
		list.clear();
		expect(list.size).toBe(0);
	});
});

describe('EdgeList#size', () => {
	it('should reflect the number of edges', () => {
		expect(list.size).toBe(0);
		list.set(10, 'a');
		expect(list.size).toBe(1);
	});
});

describe('EdgeList#chars()', () => {
	it('should return an iterator over the labels (chars) of the edges', () => {
		list.set(5, 'a');
		list.set(8, 'b');
		list.set(4, 'c');
		expectThatArrayIsPermutationOfOther([...list.chars()], [5, 8, 4]);
	});
});

describe('EdgeList#nodes()', () => {
	it('should return an iterator over the nodes that the edges point to', () => {
		list.set(5, 'b');
		list.set(6, 'c');
		list.set(7, 'd');
		expectThatArrayIsPermutationOfOther([...list.nodes()], ['b', 'c', 'd']);
	});
});

it('should be iterable', () => {
	list.set(8, 'a');
	list.set(50, 'd');
	list.set(4, 'e');
	expectThatArrayIsPermutationOfOther(
		[...list],
		[
			[8, 'a'],
			[50, 'd'],
			[4, 'e'],
		],
	);
});
