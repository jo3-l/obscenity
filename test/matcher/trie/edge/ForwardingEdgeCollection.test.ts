import { ArrayEdgeCollection } from '../../../../src/matcher/trie/edge/ArrayEdgeCollection';
import { BucketEdgeCollection } from '../../../../src/matcher/trie/edge/BucketEdgeCollection';
import type { Edge } from '../../../../src/matcher/trie/edge/EdgeCollection';
import { ForwardingEdgeCollection } from '../../../../src/matcher/trie/edge/ForwardingEdgeCollection';
import { CharacterCode } from '../../../../src/util/Char';

let coll: ForwardingEdgeCollection<number>;

beforeEach(() => {
	coll = new ForwardingEdgeCollection<number>();
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('ForwardingEdgeCollection#set()', () => {
	it('should use the array implementation by default', () => {
		const spy = jest.spyOn(ArrayEdgeCollection.prototype, 'set');
		coll.set(5, 7);
		expect(coll.underlyingImplementation).toBeInstanceOf(ArrayEdgeCollection);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(5, 7);
	});

	it('should switch to the bucket implementation if the number of edges is > 10 and the keys are all lowercase', () => {
		const spy = jest.spyOn(BucketEdgeCollection.prototype, 'set');
		const edges = [...new Array(11).keys()].map<Edge<number>>((i) => [i + CharacterCode.LowerA, i]);
		for (const edge of edges) coll.set(...edge);
		expect(coll.underlyingImplementation).toBeInstanceOf(BucketEdgeCollection);
		expect(spy).toHaveBeenCalledTimes(11);
		expect(spy.mock.calls).toBePermutationOf(edges);
	});

	it('should switch back to the array implementation if currently using the bucket implementation and an edge with a non-lowercase key is added', () => {
		const bucketImplSpy = jest.spyOn(BucketEdgeCollection.prototype, 'set');
		const arrayImplSpy = jest.spyOn(ArrayEdgeCollection.prototype, 'set');
		const edges = [...new Array(11).keys()].map<Edge<number>>((i) => [i + CharacterCode.LowerA, i]);
		for (const edge of edges) coll.set(...edge);
		coll.set(5, 19);
		expect(bucketImplSpy).toHaveBeenCalledTimes(11);
		expect(bucketImplSpy).not.toHaveBeenCalledWith(5, 19);
		expect(coll.underlyingImplementation).toBeInstanceOf(ArrayEdgeCollection);
		expect(arrayImplSpy).toHaveBeenCalledTimes(23);
		expect(arrayImplSpy.mock.calls).toBePermutationOf([...edges, ...edges, [5, 19]]);
	});

	it('should use the map implementation if the number of edges is > 35', () => {
		const spy = jest.spyOn(Map.prototype, 'set');
		const edges = [...new Array(36).keys()].map<Edge<number>>((i) => [i, i + 5]);
		for (const edge of edges) coll.set(...edge);
		expect(coll.underlyingImplementation).toBeInstanceOf(Map);
		expect(spy).toHaveBeenCalledTimes(36);
		expect(spy.mock.calls).toBePermutationOf(edges);
	});
});

function getEdgeCollWithArrayImpl() {
	const coll = new ForwardingEdgeCollection<number>();
	coll.set(5, 19);
	return coll;
}

function getEdgeCollWithBucketImpl() {
	const coll = new ForwardingEdgeCollection<number>();
	for (let i = 0; i < 11; i++) coll.set(i + CharacterCode.LowerA, i);
	return coll;
}

function getEdgeCollWithMapImpl() {
	const coll = new ForwardingEdgeCollection<number>();
	for (let i = 0; i < 36; i++) coll.set(i, i + 5);
	return coll;
}

describe('ForwardingEdgeCollection#get()', () => {
	it('should forward the call to the array implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(ArrayEdgeCollection.prototype, 'get');
		getEdgeCollWithArrayImpl().get(5);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(5);
	});

	it('should forward the call to the bucket implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(BucketEdgeCollection.prototype, 'get');
		getEdgeCollWithBucketImpl().get(95);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(95);
	});

	it('should forward the call to the map implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(Map.prototype, 'get');
		getEdgeCollWithMapImpl().get(39);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenLastCalledWith(39);
	});
});

describe.each<'keys' | 'values'>(['keys', 'values'])('ForwardingEdgeCollection#%s()', (method) => {
	it('should forward the call to the array implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(ArrayEdgeCollection.prototype, method);
		getEdgeCollWithArrayImpl()[method]();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should forward the call to the bucket implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(BucketEdgeCollection.prototype, method);
		getEdgeCollWithBucketImpl()[method]();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should forward the call to the map implementation if that is the underlying implementation', () => {
		const spy = jest.spyOn(Map.prototype, method);
		getEdgeCollWithMapImpl()[method]();
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
