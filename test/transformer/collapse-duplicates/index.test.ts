import type { CollapseDuplicatesTransformerOptions } from '../../../src/transformer/collapse-duplicates/index';
import { collapseDuplicatesTransformer } from '../../../src/transformer/collapse-duplicates/index';
import { CollapseDuplicatesTransformer as _CollapseDuplicatesTransformer } from '../../../src/transformer/collapse-duplicates/transformer';
import { TransformerType } from '../../../src/transformer/Transformers';
import { CharacterCode } from '../../../src/util/Char';

jest.mock('../../../src/transformer/collapse-duplicates/transformer');

const CollapseDuplicatesTransformer = _CollapseDuplicatesTransformer as jest.MockedClass<
	typeof _CollapseDuplicatesTransformer
>;

beforeEach(() => {
	CollapseDuplicatesTransformer.mockClear();
});

describe('collapseDuplicatesTransformer()', () => {
	describe('customThresholds processing', () => {
		it('should throw if any threshold was < 0', () => {
			expect(() => collapseDuplicatesTransformer({ customThresholds: new Map([['a', -1]]) })).toThrow(RangeError);
		});

		it('should not throw for threshold=0', () => {
			expect(() => collapseDuplicatesTransformer({ customThresholds: new Map([['a', 0]]) })).not.toThrow(RangeError);
		});

		it('should throw if the string corresponding to a threshold had length 0', () => {
			expect(() => collapseDuplicatesTransformer({ customThresholds: new Map([['', 1]]) })).toThrow(RangeError);
		});

		it('should throw if the string corresponding to a threshold was comprised of more than 1 code point', () => {
			expect(() => collapseDuplicatesTransformer({ customThresholds: new Map([['ab', 1]]) })).toThrow(RangeError);
		});

		it("should create a map of character code => threshold and pass that to CollapseDuplicateTransformer's constructor", () => {
			collapseDuplicatesTransformer({
				customThresholds: new Map([
					['a', 2],
					['z', 3],
				]),
			}).factory();
			expect(CollapseDuplicatesTransformer).toHaveBeenCalledTimes(1);
			expect(CollapseDuplicatesTransformer.mock.calls[0][0]).toMatchObject({
				customThresholds: new Map([
					[CharacterCode.LowerA, 2],
					[CharacterCode.LowerZ, 3],
				]),
			});
		});
	});

	it("should pass the options given to CollapseDuplicatesTransformer's constructor", () => {
		const options: CollapseDuplicatesTransformerOptions = {
			defaultThreshold: 5,
			customThresholds: new Map([
				['a', 2],
				['z', 3],
			]),
		};
		collapseDuplicatesTransformer(options).factory();
		expect(CollapseDuplicatesTransformer).toHaveBeenCalledTimes(1);
		expect(CollapseDuplicatesTransformer).toHaveBeenLastCalledWith({
			defaultThreshold: 5,
			customThresholds: new Map([
				[CharacterCode.LowerA, 2],
				[CharacterCode.LowerZ, 3],
			]),
		});
	});

	it('should use 1 as the value for defaultThreshold if not provided', () => {
		const options: CollapseDuplicatesTransformerOptions = {
			customThresholds: new Map([
				['a', 2],
				['z', 3],
			]),
		};
		collapseDuplicatesTransformer(options).factory();
		expect(CollapseDuplicatesTransformer).toHaveBeenCalledTimes(1);
		expect(CollapseDuplicatesTransformer).toHaveBeenLastCalledWith({
			defaultThreshold: 1,
			customThresholds: new Map([
				[CharacterCode.LowerA, 2],
				[CharacterCode.LowerZ, 3],
			]),
		});
	});

	it('should use an empty map as the value for customThresholds if not provided', () => {
		const options: CollapseDuplicatesTransformerOptions = {
			defaultThreshold: 1,
		};
		collapseDuplicatesTransformer(options).factory();
		expect(CollapseDuplicatesTransformer).toHaveBeenCalledTimes(1);
		expect(CollapseDuplicatesTransformer).toHaveBeenLastCalledWith({ ...options, customThresholds: new Map() });
	});

	it('should return a stateful transformer container', () => {
		const container = collapseDuplicatesTransformer();
		expect(container.type).toBe(TransformerType.Stateful);
		expect(container.factory).toStrictEqual(expect.any(Function));
	});
});
