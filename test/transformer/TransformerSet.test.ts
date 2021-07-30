import { createSimpleTransformer, createStatefulTransformer } from '../../src/transformer/Transformers';
import { TransformerSet } from '../../src/transformer/TransformerSet';

describe('TransformerSet#applyTo()', () => {
	it('should be a noop if no transformers were provided', () => {
		expect(new TransformerSet([]).applyTo(32)).toBe(32);
	});

	it('should work with simple transformers', () => {
		const fn = jest.fn((c: number) => c + 1);
		expect(new TransformerSet([createSimpleTransformer(fn)]).applyTo(5)).toBe(6);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenLastCalledWith(5);
	});

	it('should work with stateful transformers', () => {
		const instance = {
			transform: jest.fn((c) => c + 1),
			reset: jest.fn(),
		};
		expect(new TransformerSet([createStatefulTransformer(() => instance)]).applyTo(7)).toBe(8);
		expect(instance.transform).toHaveBeenCalledTimes(1);
		expect(instance.transform).toHaveBeenLastCalledWith(7);
		expect(instance.reset).not.toHaveBeenCalled();
	});

	it('should pass the transformed value to the next transformer', () => {
		const fn0 = jest.fn((c: number) => c + 1);
		const fn1 = jest.fn((c: number) => c + 2);
		expect(new TransformerSet([createSimpleTransformer(fn0), createSimpleTransformer(fn1)]).applyTo(5)).toBe(8);
		expect(fn0).toHaveBeenCalledTimes(1);
		expect(fn0).toHaveBeenLastCalledWith(5);
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn1).toHaveBeenLastCalledWith(6);
	});

	it('should short circuit if a transformer returns undefined', () => {
		const fn0 = jest.fn((c: number) => c + 1);
		const fn1 = jest.fn((c: number) => undefined);
		const fn2 = jest.fn((c: number) => c + 3);
		expect(
			new TransformerSet([
				createSimpleTransformer(fn0),
				createSimpleTransformer(fn1),
				createSimpleTransformer(fn2),
			]).applyTo(6),
		).toBeUndefined();
		expect(fn0).toHaveBeenCalledTimes(1);
		expect(fn0).toHaveBeenLastCalledWith(6);
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn1).toHaveBeenLastCalledWith(7);
		expect(fn2).not.toHaveBeenCalled();
	});

	it('should work with a mix of different types of transformers', () => {
		const instance = {
			transform: jest.fn((c) => c + 1),
			reset: jest.fn(),
		};
		const fn0 = jest.fn((c: number) => c + 2);
		const fn1 = jest.fn((c: number) => c + 3);
		expect(
			new TransformerSet([
				createStatefulTransformer(() => instance),
				createSimpleTransformer(fn0),
				createSimpleTransformer(fn1),
			]).applyTo(5),
		).toBe(11);
		expect(instance.transform).toHaveBeenCalledTimes(1);
		expect(instance.transform).toHaveBeenLastCalledWith(5);
		expect(fn0).toHaveBeenCalledTimes(1);
		expect(fn0).toHaveBeenLastCalledWith(6);
		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn1).toHaveBeenLastCalledWith(8);
	});

	it('should apply transformers in order', () => {
		const calls: number[] = [];
		const fn0 = (c: number) => {
			calls.push(0);
			return c + 1;
		};
		const fn1 = (c: number) => {
			calls.push(1);
			return c + 2;
		};
		expect(new TransformerSet([createSimpleTransformer(fn0), createSimpleTransformer(fn1)]).applyTo(5)).toBe(8);
		expect(calls).toStrictEqual([0, 1]);
	});
});

describe('TransformerSet#resetAll()', () => {
	it('should call the reset() method of all stateful transformers once', () => {
		const instance0 = {
			transform: (c: number) => c + 1,
			reset: jest.fn(),
		};
		const fn = (c: number) => c + 1;
		const instance1 = {
			transform: (c: number) => c + 2,
			reset: jest.fn(),
		};
		const ts = new TransformerSet([
			createStatefulTransformer(() => instance0),
			createSimpleTransformer(fn),
			createStatefulTransformer(() => instance1),
		]);
		ts.resetAll();
		expect(instance0.reset).toHaveBeenCalledTimes(1);
		expect(instance1.reset).toHaveBeenCalledTimes(1);
	});
});
