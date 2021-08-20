import { grawlixCensorStrategy } from '../../src/censor/BuiltinStrategies';
import type { CensorContext } from '../../src/censor/TextCensor';
import { TextCensor } from '../../src/censor/TextCensor';

describe('TextCensor#setStrategy()', () => {
	it('should return the text censor', () => {
		const c = new TextCensor();
		expect(c.setStrategy(grawlixCensorStrategy())).toStrictEqual(c);
	});
});

describe('TextCensor#applyTo()', () => {
	const strat = jest.fn<string, [CensorContext]>().mockImplementation((k) => '.'.repeat(k.matchLength));

	afterEach(() => strat.mockClear());

	it('should return the input unmodified if there are no matches', () => {
		const censor = new TextCensor().setStrategy(strat);
		expect(censor.applyTo('text', [])).toBe('text');
		expect(strat).not.toHaveBeenCalled();
	});

	it('should call the strategy for each non-overlapping match interval (no overlaps, 1 match)', () => {
		const censor = new TextCensor().setStrategy(strat);
		const m0 = { termId: 0, matchLength: 11, startIndex: 3, endIndex: 13 };
		expect(censor.applyTo('my interesting input', [m0])).toBe('my ........... input');
		expect(strat).toHaveBeenCalledTimes(1);
		expect(strat).toHaveBeenLastCalledWith({
			...m0,
			input: 'my interesting input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should call the strategy for each non-overlapping match interval (no overlaps, 3 matches)', () => {
		const censor = new TextCensor().setStrategy(strat);
		const m0 = { termId: 0, matchLength: 4, startIndex: 0, endIndex: 3 };
		const m1 = { termId: 0, matchLength: 2, startIndex: 8, endIndex: 9 };
		const m2 = { termId: 0, matchLength: 5, startIndex: 22, endIndex: 26 };
		expect(censor.applyTo('this is my intriguing input', [m0, m1, m2])).toBe('.... is .. intriguing .....');
		expect(strat).toHaveBeenCalledTimes(3);
		expect(strat).toHaveBeenNthCalledWith(1, {
			...m0,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
		expect(strat).toHaveBeenNthCalledWith(2, {
			...m1,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
		expect(strat).toHaveBeenNthCalledWith(3, {
			...m2,
			input: 'this is my intriguing input',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should call the strategy for each non-overlapping match interval (some overlaps, 2 matches)', () => {
		const censor = new TextCensor().setStrategy(strat);
		const m0 = { termId: 0, matchLength: 5, startIndex: 0, endIndex: 4 };
		const m1 = { termId: 0, matchLength: 8, startIndex: 0, endIndex: 7 };
		expect(censor.applyTo('thinking of good test data is hard', [m0, m1])).toBe(
			'............. of good test data is hard',
		);
		expect(strat).toHaveBeenCalledTimes(2);
		expect(strat).toHaveBeenNthCalledWith(1, {
			...m0,
			input: 'thinking of good test data is hard',
			overlapsAtStart: false,
			overlapsAtEnd: true,
		});
		expect(strat).toHaveBeenNthCalledWith(2, {
			...m1,
			input: 'thinking of good test data is hard',
			startIndex: 5,
			overlapsAtStart: true,
			overlapsAtEnd: false,
		});
	});

	it('should not call the strategy for matched intervals which are completely contained in another one', () => {
		const censor = new TextCensor().setStrategy(strat);
		const m0 = { termId: 0, matchLength: 2, startIndex: 1, endIndex: 2 };
		const m1 = { termId: 0, matchLength: 1, startIndex: 2, endIndex: 2 };
		expect(censor.applyTo('tests', [m0, m1])).toBe('t..ts');
		expect(strat).toHaveBeenCalledTimes(1);
		expect(strat).toHaveBeenLastCalledWith({
			...m0,
			input: 'tests',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});

	it('should not call the strategy for matched intervals which are equal to some other one', () => {
		const censor = new TextCensor().setStrategy(strat);
		const m0 = { termId: 0, matchLength: 3, startIndex: 1, endIndex: 3 };
		const m1 = { termId: 1, matchLength: 3, startIndex: 1, endIndex: 3 };
		expect(censor.applyTo('heretical', [m0, m1])).toBe('h...tical');
		expect(strat).toHaveBeenCalledTimes(1);
		expect(strat).toHaveBeenLastCalledWith({
			...m0,
			input: 'heretical',
			overlapsAtStart: false,
			overlapsAtEnd: false,
		});
	});
});
