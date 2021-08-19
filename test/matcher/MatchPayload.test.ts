import { compareMatchByPositionAndId } from '../../src/matcher/MatchPayload';

describe('compareMatchByPositionAndId()', () => {
	const termAndMatchLen = { termId: -1, matchLength: 0 };

	it("should return -1 if the first match payload's start index is less than the second's", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...termAndMatchLen, startIndex: 5, endIndex: 7 },
				{ ...termAndMatchLen, startIndex: 6, endIndex: 8 },
			),
		).toBe(-1);
	});

	it("should return 1 if the second match payload's start index is less than the first's", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...termAndMatchLen, startIndex: 10, endIndex: 11 },
				{ ...termAndMatchLen, startIndex: 9, endIndex: 14 },
			),
		).toBe(1);
	});

	it("should return -1 if the first payload's end index is less than the second's", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...termAndMatchLen, startIndex: 8, endIndex: 11 },
				{ ...termAndMatchLen, startIndex: 8, endIndex: 12 },
			),
		).toBe(-1);
	});

	it("should return 1 if the second payload's end index if less than the first's", () => {
		expect(
			compareMatchByPositionAndId(
				{ ...termAndMatchLen, startIndex: 10, endIndex: 15 },
				{ ...termAndMatchLen, startIndex: 10, endIndex: 13 },
			),
		).toBe(1);
	});

	const posAndMatchLen = { startIndex: 0, endIndex: 0, matchLength: 0 };

	it("should return -1 if the first match payload's term ID is less than the second's and their positions are identical", () => {
		expect(compareMatchByPositionAndId({ ...posAndMatchLen, termId: 0 }, { ...posAndMatchLen, termId: 3 })).toBe(-1);
	});

	it("should return 1 if the first match payload's term ID is less than the second's and their positions are identical", () => {
		expect(compareMatchByPositionAndId({ ...posAndMatchLen, termId: 50 }, { ...posAndMatchLen, termId: 30 })).toBe(1);
	});

	it("should return 0 if the first match payload's term ID is equal to the first's and their positions are identical", () => {
		expect(compareMatchByPositionAndId({ ...posAndMatchLen, termId: 34 }, { ...posAndMatchLen, termId: 34 })).toBe(0);
	});
});
