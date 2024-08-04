import { describe, expect, it } from 'vitest';

import { CollapseDuplicatesTransformer } from '@/transformer/collapse-duplicates/transformer';

describe('CollapseDuplicatesTransformer#transform()', () => {
	describe('threshold selection', () => {
		it('should use the default threshold if there is no corresponding custom threshold', () => {
			const transformer = new CollapseDuplicatesTransformer({ defaultThreshold: 1, customThresholds: new Map() });
			expect(transformer.transform(1)).toBe(1);
			expect(transformer.transform(1)).toBeUndefined();
		});

		it('should use the custom threshold if one is provided', () => {
			const transformer = new CollapseDuplicatesTransformer({
				defaultThreshold: 1,
				customThresholds: new Map([[1, 2]]),
			});
			expect(transformer.transform(1)).toBe(1);
			expect(transformer.transform(1)).toBe(1);
			expect(transformer.transform(1)).toBeUndefined();
		});
	});

	it('should return undefined for characters with a threshold <= 0', () => {
		const transformer = new CollapseDuplicatesTransformer({ defaultThreshold: 0, customThresholds: new Map() });
		expect(transformer.transform(1)).toBeUndefined();
		expect(transformer.transform(2)).toBeUndefined();
	});

	it('should be a noop until the threshold is hit', () => {
		const transformer = new CollapseDuplicatesTransformer({ defaultThreshold: 5, customThresholds: new Map() });
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBeUndefined();
	});

	it('should reset the threshold once a different character is seen', () => {
		const transformer = new CollapseDuplicatesTransformer({
			defaultThreshold: 1,
			customThresholds: new Map([
				[1, 2],
				[2, 3],
			]),
		});
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBeUndefined();
		expect(transformer.transform(2)).toBe(2);
		expect(transformer.transform(2)).toBe(2);
		expect(transformer.transform(2)).toBe(2);
		expect(transformer.transform(2)).toBeUndefined();
	});
});

describe('CollapseDuplicatesTransformer#reset()', () => {
	it('should reset the threshold and current character', () => {
		const transformer = new CollapseDuplicatesTransformer({
			defaultThreshold: 2,
			customThresholds: new Map(),
		});
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBeUndefined();
		transformer.reset();
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBe(1);
		expect(transformer.transform(1)).toBeUndefined();
	});
});
