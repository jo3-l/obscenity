import * as fc from 'fast-check';
import { ArrayBasedEdgeStorageStrategy } from '../../../../src/matcher/trie/edge-storage/ArrayBasedEdgeStorageStrategy';

function expectThatArrayIsPermutationOfOther<T>(as: T[], bs: T[]) {
	expect(as).toStrictEqual(expect.arrayContaining(bs));
	expect(bs).toStrictEqual(expect.arrayContaining(as));
}

test('getting from the array-based edge storage strategy after setting some values should have the same result as using a map', () => {
	fc.assert(
		fc.property(fc.array(fc.tuple(fc.integer(0, 30), fc.string())), fc.array(fc.integer(0, 30)), (data, keys) => {
			const mp = new Map();
			const storage = new ArrayBasedEdgeStorageStrategy();
			for (const [k, v] of data) {
				storage.set(k, v);
				mp.set(k, v);
			}

			for (const k of keys) expect(mp.get(k)).toBe(storage.get(k));
		}),
	);
});

test('getting the values stored by the array-based edge storage strategy after setting some values should be the same as the entries of a map updated in parallel', () => {
	fc.assert(
		fc.property(fc.array(fc.tuple(fc.integer(0, 30), fc.string())), (data) => {
			const mp = new Map();
			const storage = new ArrayBasedEdgeStorageStrategy();
			for (const [k, v] of data) {
				storage.set(k, v);
				mp.set(k, v);
			}

			expectThatArrayIsPermutationOfOther([...storage], [...mp.entries()]);
		}),
	);
});

test('the size should be equal to the number of unique keys', () => {
	fc.assert(
		fc.property(fc.array(fc.tuple(fc.integer(0, 30), fc.string())), (data) => {
			const keys = new Set();
			const storage = new ArrayBasedEdgeStorageStrategy();
			for (const [k, v] of data) {
				storage.set(k, v);
				keys.add(k);
				expect(storage.size).toBe(keys.size);
			}
		}),
	);
});
