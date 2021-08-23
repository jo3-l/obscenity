import { compareIntervals } from '../../src/util/Interval';

describe('compareIntervals()', () => {
	it("should return -1 if the first interval's lower bound is less than the second's", () => {
		expect(compareIntervals(1, 5, 2, 3)).toBe(-1);
	});

	it("should return 1 if the second interval's lower bound is less than the first's", () => {
		expect(compareIntervals(2, 3, 1, 5)).toBe(1);
	});

	it("should return -1 if the first interval's upper bound is less than the second's", () => {
		expect(compareIntervals(2, 3, 2, 5)).toBe(-1);
	});

	it("should return 1 if the second interval's upper bound is less than the first's", () => {
		expect(compareIntervals(2, 5, 2, 3)).toBe(1);
	});

	it('should return 0 if the first and second intervals are equal', () => {
		expect(compareIntervals(1, 5, 1, 5)).toBe(0);
	});
});
