import {
	createSimpleTransformer,
	createStatefulTransformer,
	StatefulTransformer,
	TransformerType,
} from '../../src/transformer/Transformers';

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
	const statefulTransformer: StatefulTransformer = {
		transform: (c: number) => undefined,
		reset: () => {},
	};
	const factory = () => statefulTransformer;
	expect(createStatefulTransformer(factory)).toStrictEqual({
		type: TransformerType.Stateful,
		transformer: statefulTransformer,
	});
});
