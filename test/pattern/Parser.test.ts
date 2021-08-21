import { SyntaxKind } from '../../src/pattern/Nodes';
import { Parser } from '../../src/pattern/Parser';
import { ParserError } from '../../src/pattern/ParserError';
import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

const parser = new Parser();

it('should parse an empty string', () => {
	expect(parser.parse('')).toStrictEqual({
		requireWordBoundaryAtStart: false,
		requireWordBoundaryAtEnd: false,
		nodes: [],
	});
});

it('should not accept an unmatched right square bracket', () => {
	expect(() => parser.parse('[bar]]')).toThrow(new ParserError("Unexpected ']' with no corresponding '['.", 1, 6));
});

describe('word boundaries', () => {
	it('should return requireWordBoundaryAtStart=true if there is a | at the start', () => {
		expect(parser.parse('|')).toStrictEqual({
			requireWordBoundaryAtStart: true,
			requireWordBoundaryAtEnd: false,
			nodes: [],
		});
	});

	it('should return requireWordBoundaryAtEnd=true if there is a | at the end', () => {
		expect(parser.parse('hello|')).toMatchObject({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: true,
		});
	});

	it('should return requireWordBoundaryAtStart=true and requireWordBoundaryAtEnd=true if there is a | at both the start and the end', () => {
		expect(parser.parse('|sup|')).toMatchObject({
			requireWordBoundaryAtStart: true,
			requireWordBoundaryAtEnd: true,
		});
	});

	it('should throw an error if a word boundary is found within the pattern itself and not at its boundaries', () => {
		expect(() => parser.parse('su|p')).toThrow(
			new ParserError(
				'Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.',
				1,
				3,
			),
		);
	});
});

describe('optional nodes', () => {
	describe('optional nodes containing literals', () => {
		it('should parse an optional node containing a literal node', () => {
			expect(parser.parse('hello [world]')).toStrictEqual({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [
					{ kind: SyntaxKind.Literal, chars: [...new CharacterIterator('hello ')] },
					{
						kind: SyntaxKind.Optional,
						childNode: { kind: SyntaxKind.Literal, chars: [...new CharacterIterator('world')] },
					},
				],
			});
		});

		it('should parse an optional node containing a literal node in which a right square bracket is escaped', () => {
			expect(parser.parse(String.raw`foo [bar\] baz]`)).toStrictEqual({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [
					{ kind: SyntaxKind.Literal, chars: [...new CharacterIterator('foo ')] },
					{
						kind: SyntaxKind.Optional,
						childNode: { kind: SyntaxKind.Literal, chars: [...new CharacterIterator('bar] baz')] },
					},
				],
			});
		});
	});

	it('should parse an optional node containing a wildcard', () => {
		expect(parser.parse('?[?]')).toStrictEqual({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: false,
			nodes: [{ kind: SyntaxKind.Wildcard }, { kind: SyntaxKind.Optional, childNode: { kind: SyntaxKind.Wildcard } }],
		});
	});

	it('should throw an error if an optional node is contained in an optional node', () => {
		expect(() => parser.parse('[[a]]')).toThrow(new ParserError('Unexpected nested optional node.', 1, 2));
	});

	it('should throw an error if an optional node is unclosed (case 1: [ at the end)', () => {
		expect(() => parser.parse('[')).toThrow(new ParserError("Unexpected unclosed '['.", 1, 1));
	});

	it('should throw an error if an optional node is unclosed (case 2: optional node has content)', () => {
		expect(() => parser.parse('[aa')).toThrow(new ParserError("Unexpected unclosed '['.", 1, 3));
	});

	it('should throw an error if an optional node contains a boundary assertion', () => {
		expect(() => parser.parse('[|]')).toThrow(
			new ParserError(
				'Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.',
				1,
				2,
			),
		);
	});
});

describe('literals', () => {
	it('should parse a simple sequence of characters', () => {
		expect(parser.parse('hello world')).toStrictEqual({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: false,
			nodes: [{ kind: SyntaxKind.Literal, chars: [...new CharacterIterator('hello world')] }],
		});
	});

	it('should parse a sequence of characters containing surrogate pairs, combining said surrogate pairs into their representative code point', () => {
		expect(parser.parse('hello 🌉 world')).toStrictEqual({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: false,
			nodes: [{ kind: SyntaxKind.Literal, chars: [...new CharacterIterator('hello 🌉 world')] }],
		});
	});

	it('should parse a sequence of characters containing high surrogates without a low surrogate', () => {
		const highSurrogate = '🌉'.charCodeAt(0);
		expect(
			parser.parse(
				String.fromCharCode(CharacterCode.LowerA, CharacterCode.UpperA, highSurrogate, CharacterCode.Newline),
			),
		).toStrictEqual({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: false,
			nodes: [
				{
					kind: SyntaxKind.Literal,
					chars: [CharacterCode.LowerA, CharacterCode.UpperA, highSurrogate, CharacterCode.Newline],
				},
			],
		});
	});

	describe('escapes', () => {
		it.each([
			['backslash', String.raw`hello \\`, 'hello \\'],
			['left square bracket', String.raw`yo \[ what is up`, 'yo [ what is up'],
			['right square bracket', String.raw`\] pretty cool`, '] pretty cool'],
			['question mark', String.raw`testing is pain\?`, 'testing is pain?'],
			['vertical bar', String.raw`awesome p\|pes`, 'awesome p|pes'],
		])('should parse a sequence of characters where a %s is escaped', (_, input, expected) => {
			expect(parser.parse(input)).toStrictEqual({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [{ kind: SyntaxKind.Literal, chars: [...new CharacterIterator(expected)] }],
			});
		});

		it('should throw an error if a unsupported character is escaped', () => {
			expect(() => parser.parse(String.raw`oopsies \:`)).toThrow(
				new ParserError(
					"Cannot escape character ':'; the only characters that can be escaped are the following: '\\', '[', ']', '?', '|'.",
					1,
					10,
				),
			);
		});

		it('should throw an error on trailing backslashes', () => {
			expect(() => parser.parse('trailing \\')).toThrow(new ParserError('Unexpected trailing backslash.', 1, 10));
		});

		describe('error reporting for special characters', () => {
			it('should throw an error where the column points to the newline as if it were a normal character when escaping a newline', () => {
				expect(() => parser.parse('hello\\\n')).toThrow(
					new ParserError(
						"Cannot escape character '\n'; the only characters that can be escaped are the following: '\\', '[', ']', '?', '|'.",
						1,
						7,
					),
				);
			});

			it('should throw an error where the column points to the position of the high surrogate when escaping a surrogate pair', () => {
				expect(() => parser.parse(String.raw`why would you escape a s\🌉rrogate pair?`)).toThrow(
					new ParserError(
						"Cannot escape character '🌉'; the only characters that can be escaped are the following: '\\', '[', ']', '?', '|'.",
						1,
						26,
					),
				);
			});

			it('should count previous surrogate pairs in the text as 1 column wide', () => {
				expect(() => parser.parse(String.raw`hello 🌉 wo\rld`)).toThrow(
					new ParserError(
						"Cannot escape character 'r'; the only characters that can be escaped are the following: '\\', '[', ']', '?', '|'.",
						1,
						12,
					),
				);
			});
		});
	});
});

describe('wildcards', () => {
	it('should support wildcards', () => {
		expect(parser.parse('?')).toStrictEqual({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: false,
			nodes: [{ kind: SyntaxKind.Wildcard }],
		});
	});
});
