export function compareIntervals(a: Interval, b: Interval) {
	if (a[0] < b[0]) return -1;
	if (b[0] < a[0]) return 1;
	if (a[1] < b[1]) return -1;
	if (b[1] < a[1]) return 1;
	return 0;
}

export type Interval = [start: number, end: number]; // inclusive on both ends
