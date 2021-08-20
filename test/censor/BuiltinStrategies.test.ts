import {
	asteriskCensorStrategy,
	fixedCharCensorStrategy,
	fixedPhraseCensorStrategy,
	grawlixCensorStrategy,
	keepEndCensorStrategy,
	keepStartCensorStrategy,
	randomCharFromSetCensorStrategy,
} from '../../src/censor/BuiltinStrategies';
import type { CensorContext } from '../../src/censor/TextCensor';

const partialCtx = {
	input: '',
	overlapsAtStart: false,
	overlapsAtEnd: false,
	termId: -1,
	startIndex: 0,
	endIndex: 0,
};

describe('keepStartCensorStrategy()', () => {
	const base = jest.fn<string, [CensorContext]>().mockImplementation((k) => '.'.repeat(k.matchLength));

	afterEach(() => base.mockClear());

	it('should call the base strategy with the same arguments if overlapsAtStart is true', () => {
		const strat = keepStartCensorStrategy(base);
		const res = strat({ ...partialCtx, matchLength: 5, overlapsAtStart: true });
		expect(res).toBe('.....');
		expect(base).toHaveBeenCalledTimes(1);
		expect(base).toHaveBeenLastCalledWith({ ...partialCtx, matchLength: 5, overlapsAtStart: true });
	});

	it('should call the base strategy with matchLength-1 and add the first character of the matched region', () => {
		const strat = keepStartCensorStrategy(base);
		const ctx = {
			input: 'hello world!',
			overlapsAtStart: false,
			overlapsAtEnd: false,
			termId: -1,
			startIndex: 6,
			endIndex: 10,
			matchLength: 5,
		};
		const res = strat(ctx);
		expect(res).toBe('w....');
		expect(base).toHaveBeenCalledTimes(1);
		expect(base).toHaveBeenLastCalledWith({ ...ctx, matchLength: 4 });
	});
});

describe('keepEndCensorStrategy()', () => {
	const base = jest.fn<string, [CensorContext]>().mockImplementation((k) => '.'.repeat(k.matchLength));

	afterEach(() => base.mockClear());

	it('should call the base strategy with the same arguments if overlapsAtEnd is true', () => {
		const strat = keepEndCensorStrategy(base);
		const res = strat({ ...partialCtx, matchLength: 5, overlapsAtEnd: true });
		expect(res).toBe('.....');
		expect(base).toHaveBeenCalledTimes(1);
		expect(base).toHaveBeenLastCalledWith({ ...partialCtx, matchLength: 5, overlapsAtEnd: true });
	});

	it('should call the base strategy with matchLength-1 and add the last character of the matched region', () => {
		const strat = keepEndCensorStrategy(base);
		const ctx = {
			input: 'hello world!',
			overlapsAtStart: false,
			overlapsAtEnd: false,
			termId: -1,
			startIndex: 6,
			endIndex: 10,
			matchLength: 5,
		};
		const res = strat(ctx);
		expect(res).toBe('....d');
		expect(base).toHaveBeenCalledTimes(1);
		expect(base).toHaveBeenLastCalledWith({ ...ctx, matchLength: 4 });
	});
});

describe('asteriskCensorStrategy()', () => {
	it('should return strings that are made up of asterisks', () => {
		const strat = asteriskCensorStrategy();
		expect(strat({ ...partialCtx, matchLength: 8 })).toBe('********');
	});
});

describe('grawlixCensorStrategy()', () => {
	it('should return strings that have characters taken from the charset %@$&*', () => {
		const charset = '%@$&*';
		const strat = grawlixCensorStrategy();
		expect([...strat({ ...partialCtx, matchLength: 20 })].every((c) => charset.includes(c))).toBeTruthy();
	});
});

describe('fixedPhraseCensorStrategy()', () => {
	it('should simply return the phrase given', () => {
		const strat = fixedPhraseCensorStrategy('fixed phrase');
		expect(strat({ ...partialCtx, matchLength: 30 })).toBe('fixed phrase');
	});
});

describe('fixedCharCensorStrategy()', () => {
	it('should throw if the input string was empty', () => {
		expect(() => fixedCharCensorStrategy('')).toThrow(
			new RangeError(`Expected the input string to be one code point in length.`),
		);
	});

	it('should throw if the input string was comprised of more than one code point', () => {
		expect(() => fixedCharCensorStrategy('ab')).toThrow(
			new RangeError(`Expected the input string to be one code point in length.`),
		);
	});

	it('should not throw if the input string was a surrogate pair', () => {
		expect(() => fixedCharCensorStrategy('🌉')).not.toThrow();
	});

	it('should return the input string repeated N times (where N is the match length)', () => {
		const strat = fixedCharCensorStrategy('x');
		expect(strat({ ...partialCtx, matchLength: 7 })).toBe('xxxxxxx');
	});
});

describe('randomCharFromSetCensorStrategy()', () => {
	it('should throw if the charset is empty', () => {
		expect(() => randomCharFromSetCensorStrategy('')).toThrow(new Error('The character set passed must not be empty.'));
	});

	it('should work for matchLength 0', () => {
		const strat = randomCharFromSetCensorStrategy('abcdefghijk');
		expect(strat({ ...partialCtx, matchLength: 0 })).toBe('');
	});

	it('should return N characters (where N is the match length) from the set of characters given', () => {
		const charset = 'abcdefghijk';
		const strat = randomCharFromSetCensorStrategy(charset);
		expect([...strat({ ...partialCtx, matchLength: 5 })].every((c) => charset.includes(c))).toBeTruthy();
	});
});
