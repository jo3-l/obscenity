import { describe, it, expect } from 'vitest';

import type { StatefulTransformer } from '@/transformer/Transformers';
import { createSimpleTransformer, createStatefulTransformer, TransformerType } from '@/transformer/Transformers';

describe('TransformerType', () => {
	describe('TransformerType.Simple', () => {
		it('should equal 0', () => {
			expect(TransformerType.Simple).toBe(0);
		});
	});

	describe('TransformerType.Stateful', () => {
		it('should equal 1', () => {
			expect(TransformerType.Stateful).toBe(1);
		});
	});
});

describe('createSimpleTransformer', () => {
	it('should return a container holding the function given', () => {
		const transformer = (c: number) => c + 1;
		expect(createSimpleTransformer(transformer)).toStrictEqual({
			type: TransformerType.Simple,
			transform: transformer,
		});
	});
});

describe('createStatefulTransformer', () => {
	it('should return a container holding an instance produced by the factory given', () => {
		const statefulTransformer: StatefulTransformer = {
			transform: () => undefined,
			reset: () => {
				/* do nothing */
			},
		};
		const factory = () => statefulTransformer;
		expect(createStatefulTransformer(factory)).toStrictEqual({
			type: TransformerType.Stateful,
			factory,
		});
	});
});
