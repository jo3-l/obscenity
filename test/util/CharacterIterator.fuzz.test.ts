import * as fc from 'fast-check';

import { CharacterIterator } from '../../src/util/CharacterIterator';

test('the result of the character iterator over a string s should be equal to spreading s and mapping each value into its codepoint', () => {
	fc.assert(
		fc.property(fc.string16bits(), (str) => {
			const expected = [...str].map((s) => s.codePointAt(0)!);
			expect([...new CharacterIterator(str)]).toStrictEqual(expected);
		}),
	);
});
