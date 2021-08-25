import { BucketEdgeCollection } from '../../../../src/matcher/trie/edge/BucketEdgeCollection';

const getCode = (c: string) => c.charCodeAt(0);

let coll: BucketEdgeCollection<string>;

beforeEach(() => {
	coll = new BucketEdgeCollection<string>();
});

describe('BucketEdgeCollection#set()', () => {
	it('should add the edge to the collection', () => {
		coll.set(getCode('a'), 'x');
		expect([...coll]).toBePermutationOf([[getCode('a'), 'x']]);
	});

	it('should increment the size only if no existing edge was found', () => {
		coll.set(getCode('d'), 'a');
		expect(coll.size).toBe(1);
		coll.set(getCode('d'), 'c');
		expect(coll.size).toBe(1);
	});
});

describe('BucketEdgeCollection#get()', () => {
	it('should return the node corresponding to the character', () => {
		coll.set(getCode('c'), 'd');
		coll.set(getCode('e'), 'y');
		coll.set(getCode('z'), 'e');
		expect(coll.get(getCode('c'))).toBe('d');
		expect(coll.get(getCode('e'))).toBe('y');
		expect(coll.get(getCode('z'))).toBe('e');
	});

	it('should return undefined if no node exists', () => {
		coll.set(getCode('e'), 'd');
		coll.set(getCode('z'), 'e');
		coll.set(getCode('y'), 'z');
		coll.set(getCode('p'), 'y');
		expect(coll.get(getCode('a'))).toBeUndefined();
		expect(coll.get(getCode('w'))).toBeUndefined();
		expect(coll.get(getCode('f'))).toBeUndefined();
	});

	it('should return undefined if the key was not a lowercase letter', () => {
		expect(coll.get(-1)).toBeUndefined();
		expect(coll.get(0)).toBeUndefined();
		expect(coll.get(getCode('z') + 1)).toBeUndefined();
		expect(coll.get(getCode('a') - 1)).toBeUndefined();
		expect(coll.get(594)).toBeUndefined();
	});
});

describe('BucketEdgeCollection#keys()', () => {
	it('should return an iterator over the keys', () => {
		coll.set(getCode('z'), 'd');
		coll.set(getCode('u'), 'e');
		coll.set(getCode('n'), 'p');
		coll.set(getCode('m'), 'r');
		expect([...coll.keys()]).toBePermutationOf(['z', 'u', 'n', 'm'].map(getCode));
	});
});

describe('BucketEdgeCollection#values()', () => {
	it('should return an iterator over the values', () => {
		coll.set(getCode('l'), 'e');
		coll.set(getCode('h'), 'e');
		coll.set(getCode('a'), 'p');
		coll.set(getCode('i'), 'v');
		expect([...coll.values()]).toBePermutationOf(['e', 'e', 'p', 'v']);
	});
});

it('should be iterable', () => {
	coll.set(getCode('r'), 'j');
	coll.set(getCode('l'), 'e');
	coll.set(getCode('n'), 'p');
	coll.set(getCode('s'), 'e');
	expect([...coll]).toBePermutationOf([
		[getCode('r'), 'j'],
		[getCode('l'), 'e'],
		[getCode('n'), 'p'],
		[getCode('s'), 'e'],
	]);
});
