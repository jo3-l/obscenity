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
			expect(transformer.transform('$'.charCodeAt(0))).toBe('s'.charCodeAt(0));
		});

		it('should leave other characters as is', () => {
			const transformer = resolveLeetSpeakTransformer();
			expect(transformer.transform('e'.charCodeAt(0))).toBe('e'.charCodeAt(0));
			expect(transformer.transform(CharacterCode.Backslash)).toBe(CharacterCode.Backslash);
		});
	});
});
