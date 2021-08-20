import type { Interval } from '../../../src/matcher/interval/Interval';
import { compareIntervals } from '../../../src/matcher/interval/Interval';

describe('compareIntervals()', () => {
	it("should return -1 if the first interval's lower bound is less than the second's", () => {
		const a: Interval = [1, 5];
		const b: Interval = [2, 3];
		expect(compareIntervals(a, b)).toBe(-1);
	});

	it("should return 1 if the second interval's lower bound is less than the first's", () => {
		const a: Interval = [2, 3];
		const b: Interval = [1, 5];
		expect(compareIntervals(a, b)).toBe(1);
	});

	it("should return -1 if the first interval's upper bound is less than the second's", () => {
		const a: Interval = [2, 3];
		const b: Interval = [2, 5];
		expect(compareIntervals(a, b)).toBe(-1);
	});

	it("should return 1 if the second interval's upper bound is less than the first's", () => {
		const a: Interval = [2, 5];
		const b: Interval = [2, 3];
		expect(compareIntervals(a, b)).toBe(1);
	});

	it('should return 0 if the first and second intervals are equal', () => {
		const a: Interval = [1, 5];
		const b: Interval = [1, 5];
		expect(compareIntervals(a, b)).toBe(0);
	});
});
