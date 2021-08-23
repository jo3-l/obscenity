import { compareMatchByPositionAndId } from '../../src/matcher/MatchPayload';
import { compareIntervals as _compareIntervals } from '../../src/util/Interval';

jest.mock('../../src/util/Interval', () => ({ compareIntervals: jest.fn().mockReturnValue(0) }));

const compareIntervals = _compareIntervals as jest.MockedFunction<typeof _compareIntervals>;

afterEach(() => {
	compareIntervals.mockClear();
});

describe('compareMatchByPositionAndId()', () => {
	const termIdAndMatchLen = { termId: -1, matchLength: 0 };

	it('should call compareIntervals() and return its result if not zero', () => {
		compareIntervals.mockImplementationOnce(() => -1);
		expect(
			compareMatchByPositionAndId(
				{ ...termIdAndMatchLen, startIndex: 5, endIndex: 7 },
				{ ...termIdAndMatchLen, startIndex: 6, endIndex: 8 },
			),
		).toBe(-1);
		expect(compareIntervals).toHaveBeenCalledTimes(1);
		expect(compareIntervals).toHaveBeenLastCalledWith(5, 7, 6, 8);
	});

	const startAndEndIdxAndMatchLen = { startIndex: 0, endIndex: 0, matchLength: 0 };

	it("should return -1 if the first match payload's term ID is less than the second's and their positions are identical", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...startAndEndIdxAndMatchLen, termId: 0 },
				{ ...startAndEndIdxAndMatchLen, termId: 3 },
			),
		).toBe(-1);
	});

	it("should return 1 if the first match payload's term ID is less than the second's and their positions are identical", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...startAndEndIdxAndMatchLen, termId: 50 },
				{ ...startAndEndIdxAndMatchLen, termId: 30 },
			),
		).toBe(1);
	});

	it("should return 0 if the first match payload's term ID is equal to the first's and their positions are identical", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...startAndEndIdxAndMatchLen, termId: 34 },
				{ ...startAndEndIdxAndMatchLen, termId: 34 },
			),
		).toBe(0);
	});
});
