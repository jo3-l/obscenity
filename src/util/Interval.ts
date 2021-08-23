export function compareIntervals(lowerBound0: number, upperBound0: number, lowerBound1: number, upperBound1: number) {
	if (lowerBound0 < lowerBound1) return -1;
	if (lowerBound1 < lowerBound0) return 1;
	if (upperBound0 < upperBound1) return -1;
	if (upperBound1 < upperBound0) return 1;
	return 0;
}

export type Interval = [lowerBound: number, upperBound: number];
