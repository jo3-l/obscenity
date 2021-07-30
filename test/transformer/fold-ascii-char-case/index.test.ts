import { CharacterCode } from '../../../src/util/Char';
import { foldAsciiCharCaseTransformer } from '../../../src/transformer/fold-ascii-char-case';
import { TransformerType } from '../../../src/transformer/Transformers';

describe('foldAsciiCharCaseTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = foldAsciiCharCaseTransformer();
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('case folding', () => {
		it('should change uppercase ascii characters to lowercase', () => {
			const container = foldAsciiCharCaseTransformer();
			expect(container.transform(CharacterCode.UpperA)).toBe(CharacterCode.LowerA);
		});

		it('should leave lowercase chars unchanged', () => {
			const container = foldAsciiCharCaseTransformer();
			expect(container.transform(CharacterCode.LowerA)).toBe(CharacterCode.LowerA);
		});

		it('should leave all other characters unchanged', () => {
			const container = foldAsciiCharCaseTransformer();
			expect(container.transform(3)).toBe(3);
			expect(container.transform(CharacterCode.Backslash)).toBe(CharacterCode.Backslash);
		});
	});
});
