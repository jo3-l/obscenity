import { TransformerType } from '../../../src/transformer/Transformers';
import { skipNonAlphabeticTransformer } from '../../../src/transformer/skip-non-alphabetic';
import { CharacterCode } from '../../../src/util/Char';

describe('skipNonAlphabeticTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = skipNonAlphabeticTransformer();
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('character skipping', () => {
		it('should leave lowercase alphabet characters as is', () => {
			const transformer = skipNonAlphabeticTransformer();
			expect(transformer.transform('c'.charCodeAt(0))).toBe('c'.charCodeAt(0));
			expect(transformer.transform(CharacterCode.LowerZ)).toBe(CharacterCode.LowerZ);
		});

		it('should skip uppercase alphabet characters', () => {
			const transformer = skipNonAlphabeticTransformer();
			expect(transformer.transform('D'.charCodeAt(0))).toBe('D'.charCodeAt(0));
			expect(transformer.transform(CharacterCode.UpperA)).toBe(CharacterCode.UpperA);
		});

		it('should return undefined (skip) for all other characters', () => {
			const transformer = skipNonAlphabeticTransformer();
			expect(transformer.transform(CharacterCode.Backslash)).toBeUndefined();
			expect(transformer.transform(32)).toBeUndefined();
			expect(transformer.transform(CharacterCode.QuestionMark)).toBeUndefined();
			expect(transformer.transform(CharacterCode.Zero)).toBeUndefined();
		});
	});
});
