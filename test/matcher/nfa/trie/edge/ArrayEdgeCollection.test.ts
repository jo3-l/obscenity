import { ArrayEdgeCollection } from '../../../../../src/matcher/nfa/trie/edge/ArrayEdgeCollection';
import type { Edge } from '../../../../../src/matcher/nfa/trie/edge/EdgeCollection';

let coll: ArrayEdgeCollection<string>;

beforeEach(() => {
	coll = new ArrayEdgeCollection<string>();
});

describe('ArrayEdgeCollection#set()', () => {
	it('should add the edge to the collection', () => {
		coll.set(5, 'a');
		expect([...coll]).toBePermutationOf([[5, 'a']]);
	});

	it('should overwrite an existing edge if possible', () => {
		coll.set(1, 'y');
		coll.set(1, 'z');
		expect([...coll]).toBePermutationOf([[1, 'z']]);
	});

	it('should increment the size only if no existing edge was found', () => {
		coll.set(7, 'y');
		expect(coll.size).toBe(1);
		coll.set(7, 'z');
		expect(coll.size).toBe(1);
	});
});

const edges: Edge<string>[] = [
	[1, 'e'],
	[4, 'o'],
	[3, 'i'],
	[7, 'z'],
	[0, 'w'],
	[10, 'b'],
	[43, 'c'],
	[57, 'v'],
	[19, 'f'],
];

describe('ArrayEdgeCollection#get()', () => {
	it('should return the node corresponding to the edge (<= 10 values in the collection)', () => {
		coll.set(7, 'd');
		coll.set(9, 'z');
		coll.set(5, 'c');
		coll.set(10, 'e');
		expect(coll.get(5)).toBe('c');
		expect(coll.get(7)).toBe('d');
		expect(coll.get(9)).toBe('z');
		expect(coll.get(10)).toBe('e');
	});

	it('should return the node corresponding to the edge (> 10 values in the collection)', () => {
		for (const edge of edges) coll.set(...edge);
		expect(coll.get(1)).toBe('e');
		expect(coll.get(57)).toBe('v');
		expect(coll.get(43)).toBe('c');
		expect(coll.get(0)).toBe('w');
		expect(coll.get(10)).toBe('b');
	});

	it('should return undefined if there is no node corresponding to the edge (<= 3 values in the collection)', () => {
		coll.set(5, 'x');
		coll.set(7, 'd');
		expect(coll.get(0)).toBeUndefined();
		expect(coll.get(6)).toBeUndefined();
		expect(coll.get(494)).toBeUndefined();
	});

	it('should return undefined if there is no node corresponding to the edge (> 3 values in the collection)', () => {
		for (const edge of edges) coll.set(...edge);
		expect(coll.get(12)).toBeUndefined();
		expect(coll.get(15)).toBeUndefined();
		expect(coll.get(-1)).toBeUndefined();
		expect(coll.get(58)).toBeUndefined();
		expect(coll.get(554)).toBeUndefined();
	});
});

describe('ArrayEdgeCollection#keys()', () => {
	it('should return an iterator over the keys of the collection', () => {
		coll.set(5, 'd');
		coll.set(8, 'e');
		coll.set(3, 'x');
		coll.set(10, 'e');
		expect([...coll.keys()]).toBePermutationOf([5, 8, 3, 10]);
	});
});

describe('ArrayEdgeCollection#values()', () => {
	it('should return an iterator over the values of the collection', () => {
		coll.set(19, 'd');
		coll.set(9, 'd');
		coll.set(15, 'e');
		coll.set(13, 'e');
		expect([...coll.values()]).toBePermutationOf(['d', 'd', 'e', 'e']);
	});
});

it('should be iterable', () => {
	coll.set(12, 'j');
	coll.set(43, 'e');
	coll.set(17, 'p');
	coll.set(59, 'e');
	expect([...coll]).toBePermutationOf([
		[12, 'j'],
		[43, 'e'],
		[17, 'p'],
		[59, 'e'],
	]);
});
