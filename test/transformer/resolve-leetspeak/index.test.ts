import { resolveLeetSpeakTransformer } from '../../../src/transformer/resolve-leetspeak';
import { TransformerType } from '../../../src/transformer/Transformers';
import { CharacterCode } from '../../../src/util/Char';

describe('resolveLeetSpeakTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = resolveLeetSpeakTransformer();
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('character remapping', () => {
		it('should remap relevant characters to their normalized equivalent', () => {
			const transformer = resolveLeetSpeakTransformer();
			expect(transformer.transform('@'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('4'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('('.charCodeAt(0))).toBe('c'.charCodeAt(0));
			expect(transformer.transform('3'.charCodeAt(0))).toBe('e'.charCodeAt(0));
			expect(transformer.transform('1'.charCodeAt(0))).toBe('i'.charCodeAt(0));
			expect(transformer.transform('!'.charCodeAt(0))).toBe('i'.charCodeAt(0));
			expect(transformer.transform('|'.charCodeAt(0))).toBe('i'.charCodeAt(0));
			expect(transformer.transform('6'.charCodeAt(0))).toBe('g'.charCodeAt(0));
			expect(transformer.transform('0'.charCodeAt(0))).toBe('o'.charCodeAt(0));
			expect(transformer.transform('$'.charCodeAt(0))).toBe('s'.charCodeAt(0));
			expect(transformer.transform('5'.charCodeAt(0))).toBe('s'.charCodeAt(0));
			expect(transformer.transform('7'.charCodeAt(0))).toBe('t'.charCodeAt(0));
			expect(transformer.transform('2'.charCodeAt(0))).toBe(CharacterCode.LowerZ);
		});

		it('should leave other characters as is', () => {
			const transformer = resolveLeetSpeakTransformer();
			expect(transformer.transform('f'.charCodeAt(0))).toBe('f'.charCodeAt(0));
			expect(transformer.transform(CharacterCode.Backslash)).toBe(CharacterCode.Backslash);
		});
	});
});
