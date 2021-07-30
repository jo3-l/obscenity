import { compareIntervals, Interval } from '../../../src/matcher/interval/Interval';

describe('compareIntervals()', () => {
	it("should return -1 if the first interval's lower bound is less than the second's", () => {
		const i0: Interval = [1, 5];
		const i1: Interval = [2, 3];
		expect(compareIntervals(i0, i1)).toBe(-1);
	});

	it("should return 1 if the second interval's lower bound is less than the first's", () => {
		const i0: Interval = [2, 3];
		const i1: Interval = [1, 5];
		expect(compareIntervals(i0, i1)).toBe(1);
	});

	it("should return -1 if the first interval's upper bound is less than the second's", () => {
		const i0: Interval = [2, 3];
		const i1: Interval = [2, 5];
		expect(compareIntervals(i0, i1)).toBe(-1);
	});

	it("should return 1 if the second interval's upper bound is less than the first's", () => {
		const i0: Interval = [2, 5];
		const i1: Interval = [2, 3];
		expect(compareIntervals(i0, i1)).toBe(1);
	});

	it('should return 0 if the first and second intervals are equal', () => {
		const i0: Interval = [1, 5];
		const i1: Interval = [1, 5];
		expect(compareIntervals(i0, i1)).toBe(0);
	});
});
