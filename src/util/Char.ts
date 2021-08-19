export const enum CharacterCode {
	LowerA = 97,
	LowerZ = 122,
	UpperA = 65,
	UpperZ = 90,

	Zero = 48,
	Nine = 57,

	LeftSquareBracket = 91,
	RightSquareBracket = 93,
	QuestionMark = 63,
	Backslash = 92,
	Newline = 10,
	VerticalBar = 124,

	HighSurrogateStart = 0xd800,
	HighSurrogateEnd = 0xdbff,
	LowSurrogateStart = 0xdc00,
	LowSurrogateEnd = 0xdfff,
}

export function isHighSurrogate(char: number) {
	return CharacterCode.HighSurrogateStart <= char && char <= CharacterCode.HighSurrogateEnd;
}

export function isLowSurrogate(char: number) {
	return CharacterCode.LowSurrogateStart <= char && char <= CharacterCode.LowSurrogateEnd;
}

// See https://unicodebook.readthedocs.io/unicode_encodings.html#utf-16-surrogate-pairs.
export function convertSurrogatePairToCodePoint(highSurrogate: number, lowSurrogate: number) {
	return (
		(highSurrogate - CharacterCode.HighSurrogateStart) * 0x400 +
		lowSurrogate -
		CharacterCode.LowSurrogateStart +
		0x10000
	);
}

export function isWordChar(char: number) {
	return isDigit(char) || isAlphabetic(char);
}

export function isDigit(char: number) {
	return CharacterCode.Zero <= char && char <= CharacterCode.Nine;
}

export function isAlphabetic(char: number) {
	return isLowerCase(char) || isUpperCase(char);
}

export function isLowerCase(char: number) {
	return CharacterCode.LowerA <= char && char <= CharacterCode.LowerZ;
}

export function isUpperCase(char: number) {
	return CharacterCode.UpperA <= char && char <= CharacterCode.UpperZ;
}

// Input must be a lower-case or upper-case ASCII alphabet character.
export function invertCaseOfAlphabeticChar(char: number) {
	return char ^ 0x20;
}

// Asserts that the string is comprised of one and only one code point,
// then returns said code point.
export function getAndAssertSingleCodePoint(str: string) {
	if ([...str].length !== 1) throw new RangeError(`Expected the input string to be one code point in length.`);
	return str.codePointAt(0)!;
}
