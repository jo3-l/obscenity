import { TransformerType } from '../../../src/transformer/Transformers';
import { remapCharactersTransformer } from '../../../src/transformer/remap-characters';
import { CharacterCode } from '../../../src/util/Char';

describe('remapCharactersTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = remapCharactersTransformer({ a: 'b' });
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('options', () => {
		it('should throw if given an object where keys are comprised of more than one codepoint', () => {
			expect(() => remapCharactersTransformer({ ab: 'cd' })).toThrow(RangeError);
		});

		it('should throw if given an object where keys are empty strings', () => {
			expect(() => remapCharactersTransformer({ '': 'cd' })).toThrow(RangeError);
		});

		it('should throw if given an map where keys are comprised of more than one codepoint', () => {
			expect(() => remapCharactersTransformer(new Map([['ab', 'cd']]))).toThrow(RangeError);
		});

		it('should throw if given an map where keys are empty strings', () => {
			expect(() => remapCharactersTransformer(new Map([['', 'cd']]))).toThrow(RangeError);
		});
	});

	describe('character remapping', () => {
		it('should map any of the equivalent characters to the transformed character (object version)', () => {
			const transformer = remapCharactersTransformer({ a: 'bc' });
			expect(transformer.transform('b'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('c'.charCodeAt(0))).toBe(CharacterCode.LowerA);
		});

		it('should map any of the equivalent characters to the transformed character (map version)', () => {
			const transformer = remapCharactersTransformer(new Map([['a', 'bc']]));
			expect(transformer.transform('b'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('c'.charCodeAt(0))).toBe(CharacterCode.LowerA);
		});

		it('should leave other characters unchanged', () => {
			const transformer = remapCharactersTransformer({ a: 'bc' });
			expect(transformer.transform('e'.charCodeAt(0))).toBe('e'.charCodeAt(0));
			expect(transformer.transform('z'.charCodeAt(0))).toBe('z'.charCodeAt(0));
		});
	});
});
