import { test, fc } from '@fast-check/jest';
import { compareMatchByPositionAndId as cmp, MatchPayload } from '../../src/matcher/MatchPayload';

function span(startIndex: number, endIndex: number) {
	return { startIndex, endIndex };
}

function M({ startIndex, endIndex }: { startIndex: number; endIndex: number }, termId: number = 0): MatchPayload {
	return { startIndex, endIndex, matchLength: 0, termId };
}

describe('compareMatchByPositionAndId()', () => {
	test.each([
		{ scenario: 'a.start<b.start', want: -1, a: M(span(0, 2)), b: M(span(1, 0)) },
		{ scenario: 'a.start==b.start && a.end < b.end', want: -1, a: M(span(5, 7)), b: M(span(5, 8)) },
		{
			scenario: 'a.start==b.start && a.end==b.end && a.termId<b.termId',
			want: -1,
			a: M(span(9, 10), 6),
			b: M(span(9, 10), 8),
		},
		{
			scenario: 'a.start==b.start && a.end==b.end && a.termId==b.termId',
			want: 0,
			a: M(span(5, 9), 1),
			b: M(span(5, 9), 1),
		},
		{
			scenario: 'a.start==b.start && a.end==b.end && a.termId>b.termId',
			want: 1,
			a: M(span(1, 5), 2),
			b: M(span(1, 5), 1),
		},
		{ scenario: 'a.start==b.start && a.end>b.end', want: 1, a: M(span(8, 16)), b: M(span(8, 9)) },
		{ scenario: 'a.start>b.start', want: 1, a: M(span(5, 7)), b: M(span(0, 8)) },
	])('returns $want when $scenario', ({ want, a, b }) => {
		expect(cmp(a, b)).toBe(want);
	});

	const matchPayloadArb: fc.Arbitrary<MatchPayload> = fc
		.record({
			startIndex: fc.nat(),
			matchLength: fc.nat(),
			termId: fc.integer(),
		})
		.map((match) => ({
			...match,
			endIndex: match.startIndex + match.matchLength,
		}));
	test.prop([matchPayloadArb, matchPayloadArb])('is antisymmetric', (a, b) => {
		expect(cmp(a, b)).toBe(-cmp(b, a));
	});
	test.prop([matchPayloadArb, matchPayloadArb, matchPayloadArb])('is transitive', (a, b, c) => {
		if (cmp(a, b) === cmp(b, c)) {
			expect(cmp(a, c)).toBe(cmp(a, b));
		}
	});
});
