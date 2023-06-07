import { TransformerType } from '../../../src/transformer/Transformers';
import { toAsciiLowerCaseTransformer } from '../../../src/transformer/to-ascii-lowercase';
import { CharacterCode } from '../../../src/util/Char';

describe('toAsciiLowerCaseTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = toAsciiLowerCaseTransformer();
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('case folding', () => {
		it('should change uppercase ascii characters to lowercase', () => {
			const container = toAsciiLowerCaseTransformer();
			expect(container.transform(CharacterCode.UpperA)).toBe(CharacterCode.LowerA);
		});

		it('should leave lowercase chars unchanged', () => {
			const container = toAsciiLowerCaseTransformer();
			expect(container.transform(CharacterCode.LowerA)).toBe(CharacterCode.LowerA);
		});

		it('should leave all other characters unchanged', () => {
			const container = toAsciiLowerCaseTransformer();
			expect(container.transform(3)).toBe(3);
			expect(container.transform(CharacterCode.Backslash)).toBe(CharacterCode.Backslash);
		});
	});
});
