import { CharacterCode, convertSurrogatePairToCodePoint, isHighSurrogate, isLowSurrogate } from '../util/Char';
import { CharacterIterator } from '../util/CharacterIterator';
import type { BoundaryAssertionNode, LiteralNode, Node, OptionalNode, ParsedPattern, WildcardNode } from './Nodes';
import { SyntaxKind } from './Nodes';
import { ParserError } from './ParserError';

const supportsEscaping = [
	CharacterCode.Backslash,
	CharacterCode.LeftSquareBracket,
	CharacterCode.RightSquareBracket,
	CharacterCode.QuestionMark,
	CharacterCode.VerticalBar,
];
const supportsEscapingList = supportsEscaping.map((char) => `'${String.fromCodePoint(char)}'`).join(', ');
const eof = -1;

export class Parser {
	private input = '';
	private line = 1;
	private column = 1;
	private position = 0;

	private lastColumn = 1;
	private lastWidth = 0;

	public parse(input: string): ParsedPattern {
		this.setInput(input);

		const nodes: Node[] = [];
		const firstNode = this.nextNode();
		const requireWordBoundaryAtStart = firstNode?.kind === SyntaxKind.BoundaryAssertion;
		if (firstNode && !requireWordBoundaryAtStart) nodes.push(firstNode as Node);

		let requireWordBoundaryAtEnd = false;
		while (!this.done) {
			const pos = this.mark();
			const node = this.nextNode()!;
			if (node.kind !== SyntaxKind.BoundaryAssertion) {
				nodes.push(node);
				continue;
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!this.done) {
				this.reportError(
					'Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.',
					pos,
				);
			}
			requireWordBoundaryAtEnd = true;
		}

		return { requireWordBoundaryAtStart, requireWordBoundaryAtEnd, nodes };
	}

	private setInput(input: string) {
		this.input = input;
		this.line = 1;
		this.column = 1;
		this.position = 0;
		this.lastColumn = 1;
		this.lastWidth = 0;
		return this;
	}

	private nextNode() {
		switch (this.peek()) {
			case eof:
				return undefined;
			case CharacterCode.LeftSquareBracket:
				return this.parseOptional();
			case CharacterCode.QuestionMark:
				return this.parseWildcard();
			case CharacterCode.VerticalBar:
				return this.parseBoundaryAssertion();
			default:
				return this.parseLiteral();
		}
	}

	private get done() {
		return this.position >= this.input.length;
	}

	// Optional ::= '[' Wildcard | Text ']'
	private parseOptional(): OptionalNode {
		const preOpenBracketPos = this.mark();
		this.next(); // '['
		const postOpenBracketPos = this.mark();
		if (this.done) this.reportError("Unexpected unclosed '['.", preOpenBracketPos);
		if (this.accept('[')) this.reportError('Unexpected nested optional node.', postOpenBracketPos);

		const childNode = this.nextNode()!;
		if (childNode.kind === SyntaxKind.BoundaryAssertion) {
			this.reportError(
				'Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.',
				postOpenBracketPos,
			);
		}
		if (!this.accept(']')) this.reportError("Unexpected unclosed '['.");
		return { kind: SyntaxKind.Optional, childNode: childNode as WildcardNode | LiteralNode };
	}

	// Wildcard ::= '?'
	private parseWildcard(): WildcardNode {
		this.next(); // '?'
		return { kind: SyntaxKind.Wildcard };
	}

	// BoundaryAssertion ::= '|'
	private parseBoundaryAssertion(): BoundaryAssertionNode {
		this.next(); // '|'
		return { kind: SyntaxKind.BoundaryAssertion };
	}

	// Literal              ::= (NON_SPECIAL | '\' SUPPORTS_ESCAPING)+
	// NON_SPECIAL         ::= _any character other than '\', '?', '[', ']', or '|'_
	// SUPPORTS_ESCAPING   ::= '\' | '[' | ']' | '?' | '|'
	private parseLiteral(): LiteralNode {
		const chars: number[] = [];
		while (!this.done) {
			if (this.accept('[]?|')) {
				this.backup();
				break;
			}

			const next = this.next();
			if (next === CharacterCode.Backslash) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (this.done) {
					this.backup();
					this.reportError('Unexpected trailing backslash.');
				}

				// Can we escape the next character?
				const escaped = this.next();
				if (!supportsEscaping.includes(escaped)) {
					const repr = String.fromCodePoint(escaped);
					this.backup();
					this.reportError(
						`Cannot escape character '${repr}'; the only characters that can be escaped are the following: ${supportsEscapingList}.`,
					);
				}

				chars.push(escaped);
			} else {
				chars.push(next);
			}
		}

		return { kind: SyntaxKind.Literal, chars: chars };
	}

	private reportError(message: string, { line = this.line, column = this.column } = {}): never {
		throw new ParserError(message, line, column);
	}

	// Marks the current position.
	private mark() {
		return { line: this.line, column: this.column };
	}

	// Accepts any code point in the charset provided. Iff accepted, the character is consumed.
	private accept(charset: string) {
		const next = this.next();
		const iter = new CharacterIterator(charset);
		for (const char of iter) {
			if (char === next) return true;
		}
		this.backup();
		return false;
	}

	// Reads one code point from the input, without consuming it.
	private peek() {
		const next = this.next();
		this.backup();
		return next;
	}

	// Consumes one code point from the input.
	private next() {
		if (this.done) return eof;
		const char = this.input.charCodeAt(this.position++);
		this.lastWidth = 1;
		if (char === CharacterCode.Newline) {
			this.lastColumn = this.column;
			this.column = 1;
			this.line++;
			return char;
		}

		this.lastColumn = this.column++;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!isHighSurrogate(char) || this.done) return char;

		// Do we have a surrogate pair?
		const next = this.input.charCodeAt(this.position);
		if (isLowSurrogate(next)) {
			this.position++;
			this.lastWidth++;
			return convertSurrogatePairToCodePoint(char, next);
		}

		return char;
	}

	// Steps back one character; can only be called once per call to next().
	private backup() {
		this.position -= this.lastWidth;
		this.column = this.lastColumn;
		// Adjust line count if needed.
		if (this.lastWidth === 1 && this.input.charCodeAt(this.position) === CharacterCode.Newline) {
			this.line--;
		}
	}
}
