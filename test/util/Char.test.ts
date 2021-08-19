/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
	CharacterCode,
	convertSurrogatePairToCodePoint,
	getAndAssertSingleCodePoint,
	invertCaseOfAlphabeticChar,
	isAlphabetic,
	isDigit,
	isHighSurrogate,
	isLowerCase,
	isLowSurrogate,
	isUpperCase,
	isWordChar,
} from '../../src/util/Char';

describe('CharacterCode()', () => {
	describe.each([
		['LowerA', CharacterCode.LowerA, 97, 'a'],
		['LowerZ', CharacterCode.LowerZ, 122, 'z'],
		['UpperA', CharacterCode.UpperA, 65, 'A'],
		['UpperZ', CharacterCode.UpperZ, 90, 'Z'],
		['Zero', CharacterCode.Zero, 48, '0'],
		['Nine', CharacterCode.Nine, 57, '9'],
		['LeftSquareBracket', CharacterCode.LeftSquareBracket, 91, '['],
		['RightSquareBracket', CharacterCode.RightSquareBracket, 93, ']'],
		['QuestionMark', CharacterCode.QuestionMark, 63, '?'],
		['Backslash', CharacterCode.Backslash, 92, '\\'],
		['Newline', CharacterCode.Newline, 10, '\n'],
		['VerticalBar', CharacterCode.VerticalBar, 124, '|'],
		['HighSurrogateStart', CharacterCode.HighSurrogateStart, 0xd800],
		['HighSurrogateEnd', CharacterCode.HighSurrogateEnd, 0xdbff],
		['LowSurrogateStart', CharacterCode.LowSurrogateStart, 0xdc00],
		['LowSurrogateEnd', CharacterCode.LowSurrogateEnd, 0xdfff],
	])('CharacterCode.%s', (_, actual, expected, ...rest) => {
		it(`should equal ${expected}`, () => {
			expect(actual).toBe(expected);
		});

		if (rest.length > 0) {
			it(`should display as '${rest[0] as string}'`, () => {
				expect(String.fromCodePoint(actual)).toBe(rest[0]);
			});
		}
	});
});

describe('isHighSurrogate()', () => {
	it('should return true for CharacterCode.HighSurrogateStart', () => {
		expect(isHighSurrogate(CharacterCode.HighSurrogateStart)).toBeTruthy();
	});

	it('should return true for values in (CharacterCode.HighSurrogateStart, CharacterCode.HighSurrogateEnd)', () => {
		expect(isHighSurrogate(0xd853)).toBeTruthy();
		expect(isHighSurrogate(0xd9e4)).toBeTruthy();
		expect(isHighSurrogate(0xdbfe)).toBeTruthy();
	});

	it('should return true for CharacterCode.HighSurrogateEnd', () => {
		expect(isHighSurrogate(CharacterCode.HighSurrogateEnd)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isHighSurrogate(-500)).toBeFalsy();
		expect(isHighSurrogate(0)).toBeFalsy();
		expect(isHighSurrogate(32)).toBeFalsy();
		expect(isHighSurrogate(300)).toBeFalsy();
		expect(isHighSurrogate(4848)).toBeFalsy();
		expect(isHighSurrogate(Infinity)).toBeFalsy();
		expect(isHighSurrogate(NaN)).toBeFalsy();
	});
});

describe('isLowSurrogate()', () => {
	it('should return true for CharacterCode.LowSurrogateStart', () => {
		expect(isLowSurrogate(CharacterCode.LowSurrogateStart)).toBeTruthy();
	});

	it('should return true for values in (CharacterCode.LowSurrogateStart, CharacterCode.LowSurrogateEnd)', () => {
		expect(isLowSurrogate(0xdc50)).toBeTruthy();
		expect(isLowSurrogate(0xde45)).toBeTruthy();
		expect(isLowSurrogate(0xdfef)).toBeTruthy();
	});

	it('should return true for CharacterCode.LowSurrogateEnd', () => {
		expect(isLowSurrogate(CharacterCode.LowSurrogateEnd)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isLowSurrogate(-548)).toBeFalsy();
		expect(isLowSurrogate(0)).toBeFalsy();
		expect(isLowSurrogate(56)).toBeFalsy();
		expect(isLowSurrogate(3894)).toBeFalsy();
		expect(isLowSurrogate(Infinity)).toBeFalsy();
		expect(isLowSurrogate(NaN)).toBeFalsy();
	});
});

describe('convertSurrogatePairToCodePoint()', () => {
	it('should convert surrogate pairs to their equivalent code point', () => {
		const text = '🌉';
		const highSurrogate = text.charCodeAt(0);
		const lowSurrogate = text.charCodeAt(1);
		expect(convertSurrogatePairToCodePoint(highSurrogate, lowSurrogate)).toBe(text.codePointAt(0));
	});
});

describe('isWordChar()', () => {
	it('should return true for CharacterCode.Zero', () => {
		expect(isWordChar(CharacterCode.Zero)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.Zero, CharacterCode.Nine)', () => {
		expect(isWordChar(CharacterCode.Zero + 5)).toBeTruthy();
		expect(isWordChar(CharacterCode.Zero + 8)).toBeTruthy();
	});

	it('should return true for CharacterCode.Nine', () => {
		expect(isWordChar(CharacterCode.Nine)).toBeTruthy();
	});

	it('should return true for CharacterCode.LowerA', () => {
		expect(isWordChar(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.LowerA, CharacterCode.LowerZ)', () => {
		expect(isWordChar(CharacterCode.LowerA + 3)).toBeTruthy();
		expect(isWordChar(CharacterCode.LowerA + 12)).toBeTruthy();
		expect(isWordChar(CharacterCode.LowerA + 20)).toBeTruthy();
	});

	it('should return true for CharacterCode.LowerZ', () => {
		expect(isWordChar(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return true for CharacterCode.UpperA', () => {
		expect(isWordChar(CharacterCode.UpperA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.UpperA, CharacterCode.UpperZ)', () => {
		expect(isWordChar(CharacterCode.UpperA + 5)).toBeTruthy();
		expect(isWordChar(CharacterCode.UpperA + 20)).toBeTruthy();
		expect(isWordChar(CharacterCode.UpperA + 25)).toBeTruthy();
	});

	it('should return true for CharacterCode.UpperZ', () => {
		expect(isWordChar(CharacterCode.UpperZ)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isWordChar(Infinity)).toBeFalsy();
		expect(isWordChar(NaN)).toBeFalsy();
		expect(isWordChar(CharacterCode.QuestionMark)).toBeFalsy();
		expect(isWordChar(-1)).toBeFalsy();
		expect(isWordChar(CharacterCode.Newline)).toBeFalsy();
	});
});

describe('isDigit()', () => {
	it('should return true for CharacterCode.Zero', () => {
		expect(isDigit(CharacterCode.Zero)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.Zero, CharacterCode.Nine)', () => {
		expect(isDigit(CharacterCode.Zero + 5)).toBeTruthy();
		expect(isDigit(CharacterCode.Zero + 8)).toBeTruthy();
	});

	it('should return true for CharacterCode.Nine', () => {
		expect(isDigit(CharacterCode.Nine)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isDigit(CharacterCode.LowerA + 20)).toBeFalsy();
		expect(isDigit(CharacterCode.UpperA)).toBeFalsy();
		expect(isDigit(Infinity)).toBeFalsy();
		expect(isDigit(NaN)).toBeFalsy();
		expect(isDigit(CharacterCode.QuestionMark)).toBeFalsy();
		expect(isDigit(-1)).toBeFalsy();
		expect(isDigit(CharacterCode.Newline)).toBeFalsy();
	});
});

describe('isAlphabetic()', () => {
	it('should return true for CharacterCode.LowerA', () => {
		expect(isAlphabetic(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.LowerA, CharacterCode.LowerZ)', () => {
		expect(isAlphabetic(CharacterCode.LowerA + 3)).toBeTruthy();
		expect(isAlphabetic(CharacterCode.LowerA + 12)).toBeTruthy();
		expect(isAlphabetic(CharacterCode.LowerA + 20)).toBeTruthy();
	});

	it('should return true for CharacterCode.LowerZ', () => {
		expect(isAlphabetic(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return true for CharacterCode.UpperA', () => {
		expect(isAlphabetic(CharacterCode.UpperA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.UpperA, CharacterCode.UpperZ)', () => {
		expect(isAlphabetic(CharacterCode.UpperA + 5)).toBeTruthy();
		expect(isAlphabetic(CharacterCode.UpperA + 20)).toBeTruthy();
		expect(isAlphabetic(CharacterCode.UpperA + 25)).toBeTruthy();
	});

	it('should return true for CharacterCode.UpperZ', () => {
		expect(isAlphabetic(CharacterCode.UpperZ)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isAlphabetic(CharacterCode.Zero + 4)).toBeFalsy();
		expect(isAlphabetic(CharacterCode.Nine)).toBeFalsy();
		expect(isAlphabetic(Infinity)).toBeFalsy();
		expect(isAlphabetic(NaN)).toBeFalsy();
		expect(isAlphabetic(CharacterCode.QuestionMark)).toBeFalsy();
		expect(isAlphabetic(-1)).toBeFalsy();
		expect(isAlphabetic(CharacterCode.Newline)).toBeFalsy();
	});
});

describe('isLowerCase()', () => {
	it('should return true for CharacterCode.LowerA', () => {
		expect(isLowerCase(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.LowerA, CharacterCode.LowerZ)', () => {
		expect(isLowerCase(CharacterCode.LowerA + 3)).toBeTruthy();
		expect(isLowerCase(CharacterCode.LowerA + 12)).toBeTruthy();
		expect(isLowerCase(CharacterCode.LowerA + 20)).toBeTruthy();
	});

	it('should return true for CharacterCode.LowerZ', () => {
		expect(isLowerCase(CharacterCode.LowerA)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isLowerCase(CharacterCode.UpperA)).toBeFalsy();
		expect(isLowerCase(CharacterCode.UpperZ)).toBeFalsy();
		expect(isLowerCase(Infinity)).toBeFalsy();
		expect(isLowerCase(NaN)).toBeFalsy();
		expect(isLowerCase(CharacterCode.QuestionMark)).toBeFalsy();
		expect(isLowerCase(-1)).toBeFalsy();
		expect(isLowerCase(CharacterCode.Newline)).toBeFalsy();
	});
});

describe('isUpperCase()', () => {
	it('should return true for CharacterCode.UpperA', () => {
		expect(isUpperCase(CharacterCode.UpperA)).toBeTruthy();
	});

	it('should return true for values in the range (CharacterCode.UpperA, CharacterCode.UpperZ)', () => {
		expect(isUpperCase(CharacterCode.UpperA + 5)).toBeTruthy();
		expect(isUpperCase(CharacterCode.UpperA + 20)).toBeTruthy();
		expect(isUpperCase(CharacterCode.UpperA + 25)).toBeTruthy();
	});

	it('should return true for CharacterCode.UpperZ', () => {
		expect(isUpperCase(CharacterCode.UpperZ)).toBeTruthy();
	});

	it('should return false for everything else', () => {
		expect(isUpperCase(CharacterCode.LowerA)).toBeFalsy();
		expect(isUpperCase(CharacterCode.LowerZ)).toBeFalsy();
		expect(isUpperCase(Infinity)).toBeFalsy();
		expect(isUpperCase(NaN)).toBeFalsy();
		expect(isUpperCase(CharacterCode.QuestionMark)).toBeFalsy();
		expect(isUpperCase(-1)).toBeFalsy();
		expect(isUpperCase(CharacterCode.Newline)).toBeFalsy();
	});
});

describe('invertCaseOfAlphabeticChar()', () => {
	it('should return uppercase for lowercase characters', () => {
		expect(invertCaseOfAlphabeticChar(CharacterCode.LowerA)).toBe(CharacterCode.UpperA);
		expect(invertCaseOfAlphabeticChar(CharacterCode.LowerZ)).toBe(CharacterCode.UpperZ);
		expect(invertCaseOfAlphabeticChar(CharacterCode.LowerA + 5)).toBe(CharacterCode.UpperA + 5);
		expect(invertCaseOfAlphabeticChar(CharacterCode.LowerA + 20)).toBe(CharacterCode.UpperA + 20);
	});

	it('should return lowercase for uppercase characters', () => {
		expect(invertCaseOfAlphabeticChar(CharacterCode.UpperA)).toBe(CharacterCode.LowerA);
		expect(invertCaseOfAlphabeticChar(CharacterCode.UpperZ)).toBe(CharacterCode.LowerZ);
		expect(invertCaseOfAlphabeticChar(CharacterCode.UpperA + 5)).toBe(CharacterCode.LowerA + 5);
		expect(invertCaseOfAlphabeticChar(CharacterCode.UpperA + 20)).toBe(CharacterCode.LowerA + 20);
	});
});

describe('getAndAssertSingleCodePoint()', () => {
	it('should throw if the input string had length 0', () => {
		expect(() => getAndAssertSingleCodePoint('')).toThrow(RangeError);
	});

	it('should throw if the input string had more than 1 code point', () => {
		expect(() => getAndAssertSingleCodePoint('ab')).toThrow(RangeError);
	});

	it('should return the first code point if the string only had 1 code point', () => {
		expect(getAndAssertSingleCodePoint('🌉')).toBe('🌉'.codePointAt(0));
	});
});
