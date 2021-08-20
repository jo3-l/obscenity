import * as fc from 'fast-check';

import { BucketBasedEdgeStorageStrategy } from '../../../../src/matcher/trie/edge-storage/BucketBasedEdgeStorageStrategy';
import { CharacterCode } from '../../../../src/util/Char';

test('getting from the bucket-based edge storage strategy after setting some values should have the same result as using a map', () => {
	fc.assert(
		fc.property(
			fc.array(fc.tuple(fc.integer(CharacterCode.LowerA, CharacterCode.LowerZ), fc.string())),
			fc.array(fc.integer(CharacterCode.LowerA, CharacterCode.LowerZ)),
			(data, keys) => {
				const map = new Map();
				const storage = new BucketBasedEdgeStorageStrategy({
					charToBucketMapper: (c) => c - CharacterCode.LowerA,
					// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
					bucketToCharMapper: (b) => CharacterCode.LowerA + b,
				});
				for (const [k, v] of data) {
					storage.set(k, v);
					map.set(k, v);
				}

				for (const k of keys) expect(map.get(k)).toBe(storage.get(k));
			},
		),
	);
});

test('getting the values stored by the array-based edge storage strategy after setting some values should be the same as the entries of a map updated in parallel', () => {
	fc.assert(
		fc.property(fc.array(fc.tuple(fc.integer(CharacterCode.LowerA, CharacterCode.LowerZ), fc.string())), (data) => {
			const map = new Map();
			const storage = new BucketBasedEdgeStorageStrategy({
				charToBucketMapper: (c) => c - CharacterCode.LowerA,
				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				bucketToCharMapper: (b) => CharacterCode.LowerA + b,
			});
			for (const [k, v] of data) {
				storage.set(k, v);
				map.set(k, v);
			}

			expect([...storage]).toBePermutationOf([...map.entries()]);
		}),
	);
});

test('the size should be equal to the number of unique keys', () => {
	fc.assert(
		fc.property(fc.array(fc.tuple(fc.integer(CharacterCode.LowerA, CharacterCode.LowerZ), fc.string())), (data) => {
			const keys = new Set();
			const storage = new BucketBasedEdgeStorageStrategy({
				charToBucketMapper: (c) => c - CharacterCode.LowerA,
				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				bucketToCharMapper: (b) => CharacterCode.LowerA + b,
			});
			for (const [k, v] of data) {
				storage.set(k, v);
				keys.add(k);
				expect(storage.size).toBe(keys.size);
			}
		}),
	);
});
