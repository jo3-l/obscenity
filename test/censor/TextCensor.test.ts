import { describe, expect, it, vi, afterEach } from 'vitest';

import { grawlixCensorStrategy } from '@/censor/BuiltinStrategies';
import type { TextCensorStrategy } from '@/censor/TextCensor';
import { TextCensor } from '@/censor/TextCensor';

describe('TextCensor#setStrategy()', () => {
	it('should return the text censor', () => {
		const censor = new TextCensor();
		expect(censor.setStrategy(grawlixCensorStrategy())).toStrictEqual(censor);
	});
});

describe('TextCensor#applyTo()', () => {
	const strategy = vi.fn<TextCensorStrategy>().mockImplementation((k) => '.'.repeat(k.matchLength));

	afterEach(() => {
		strategy.mockClear();
	});

	it('should return the input unmodified if there are no matches', () => {
		const censor = new TextCensor().setStrategy(strategy);
		expect(censor.applyTo('text', [])).toBe('text');
		expect(strategy).not.toHaveBeenCalled();
	});

	it('should call the strategy for each non-overlapping match interval (no overlaps, 1 match)', () => {
		const censor = new TextCensor().setStrategy(strategy);
		const firstMatch = { termId: 0, matchLength: 11, startIndex: 3, endIndex: 13 };
		expect(censor.applyTo('my interesting input', [firstMatch])).toBe('my ........... input');
		expect(strategy).toHaveBeenCalledTimes(1);
		expect(strategy).toHaveBeenLastCalledWith({
			...firstMatch,
			input: 'my interesting input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should call the strategy for each non-overlapping match interval (no overlaps, 3 matches)', () => {
		const censor = new TextCensor().setStrategy(strategy);
		const firstMatch = { termId: 0, matchLength: 4, startIndex: 0, endIndex: 3 };
		const secondMatch = { termId: 0, matchLength: 2, startIndex: 8, endIndex: 9 };
		const thirdMatch = { termId: 0, matchLength: 5, startIndex: 22, endIndex: 26 };
		expect(censor.applyTo('this is my intriguing input', [firstMatch, secondMatch, thirdMatch])).toBe(
			'.... is .. intriguing .....',
		);
		expect(strategy).toHaveBeenCalledTimes(3);
		expect(strategy).toHaveBeenNthCalledWith(1, {
			...firstMatch,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
		expect(strategy).toHaveBeenNthCalledWith(2, {
			...secondMatch,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
		expect(strategy).toHaveBeenNthCalledWith(3, {
			...thirdMatch,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should call the strategy for each non-overlapping match interval (some overlaps, 2 matches)', () => {
		const censor = new TextCensor().setStrategy(strategy);
		const firstMatch = { termId: 0, matchLength: 5, startIndex: 0, endIndex: 4 };
		const secondMatch = { termId: 0, matchLength: 8, startIndex: 0, endIndex: 7 };
		expect(censor.applyTo('thinking of good test data is hard', [firstMatch, secondMatch])).toBe(
			'............. of good test data is hard',
		);
		expect(strategy).toHaveBeenCalledTimes(2);
		expect(strategy).toHaveBeenNthCalledWith(1, {
			...firstMatch,
			input: 'thinking of good test data is hard',
			overlapsAtStart: false,
			overlapsAtEnd: true,
		});
		expect(strategy).toHaveBeenNthCalledWith(2, {
			...secondMatch,
			input: 'thinking of good test data is hard',
			startIndex: 5,
			overlapsAtStart: true,
			overlapsAtEnd: false,
		});
	});

	it('should not call the strategy for matched intervals which are completely contained in another one', () => {
		const censor = new TextCensor().setStrategy(strategy);
		const firstMatch = { termId: 0, matchLength: 2, startIndex: 1, endIndex: 2 };
		const secondMatch = { termId: 0, matchLength: 1, startIndex: 2, endIndex: 2 };
		expect(censor.applyTo('tests', [firstMatch, secondMatch])).toBe('t..ts');
		expect(strategy).toHaveBeenCalledTimes(1);
		expect(strategy).toHaveBeenLastCalledWith({
			...firstMatch,
			input: 'tests',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should not call the strategy for matched intervals which are equal to some other one', () => {
		const censor = new TextCensor().setStrategy(strategy);
		const firstMatch = { termId: 0, matchLength: 3, startIndex: 1, endIndex: 3 };
		const secondMatch = { termId: 1, matchLength: 3, startIndex: 1, endIndex: 3 };
		expect(censor.applyTo('heretical', [firstMatch, secondMatch])).toBe('h...tical');
		expect(strategy).toHaveBeenCalledTimes(1);
		expect(strategy).toHaveBeenLastCalledWith({
			...firstMatch,
			input: 'heretical',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});
});
