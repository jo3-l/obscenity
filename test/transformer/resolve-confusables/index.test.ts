import { describe, it, expect } from 'vitest';

import { TransformerType } from '@/transformer/Transformers';
import { resolveConfusablesTransformer } from '@/transformer/resolve-confusables';
import { CharacterCode } from '@/util/Char';

describe('resolveConfusablesTransformer()', () => {
	it('should return a simple transformer container', () => {
		const container = resolveConfusablesTransformer();
		expect(container.type).toBe(TransformerType.Simple);
		expect(typeof container.transform).toBe('function');
	});

	describe('character remapping', () => {
		it('should remap relevant characters to their normalized equivalent', () => {
			const transformer = resolveConfusablesTransformer();
			expect(transformer.transform('⓵'.codePointAt(0)!)).toBe('1'.charCodeAt(0));
			expect(transformer.transform('❌'.codePointAt(0)!)).toBe('X'.codePointAt(0));
		});

		it('should leave other characters unchanged', () => {
			const transformer = resolveConfusablesTransformer();
			expect(transformer.transform(CharacterCode.LowerA)).toBe(CharacterCode.LowerA);
		});
	});
});
