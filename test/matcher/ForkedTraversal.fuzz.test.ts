import * as fc from 'fast-check';
import { ForkedTraversal, ForkedTraversalResponse } from '../../src/matcher/ForkedTraversal';
import { LiteralNode, SyntaxKind } from '../../src/pattern/Nodes';
import { SimpleNode } from '../../src/pattern/Simplifier';
import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

test('running the forked traversal to completion on a certain pattern and input should produce the same result as running an equivalent regexp on the input', () => {
	fc.assert(
		fc.property(
			fc
				.stringOf(fc.oneof(fc.char16bits(), fc.char16bits(), fc.constant('?')))
				.filter((t) => t.length > 0)
				.chain((pattern) =>
					fc.tuple(
						fc.constant(pattern),
						fc.oneof(
							// random strings
							fc.string16bits(),
							fc.string16bits(),
							// generated string that should match the pattern
							fc.char().chain((c) => {
								let gen = '';
								for (const char of new CharacterIterator(pattern)) {
									if (char === CharacterCode.QuestionMark) gen += c;
									else gen += String.fromCodePoint(char);
								}
								return fc.constant(gen);
							}),
						),
					),
				),
			([pat, input]) => {
				const regexp = toRegExp(pat);
				const nodes = toPattern(pat);
				const traversal = new ForkedTraversal({
					patternId: -1,
					preFragmentMatchLength: 0,
					flags: 0,
					nodes,
				});

				let traversalMatched = false;
				const it = new CharacterIterator(input);
				outer: for (const char of it) {
					switch (traversal.consume(char)) {
						case ForkedTraversalResponse.FoundMatch:
							traversalMatched = it.done; // fall through
						case ForkedTraversalResponse.Destroy:
							break outer;
					}
				}

				expect(traversalMatched).toBe(regexp.test(input));
			},
		),
	);
});

const regExpSpecialChars = ['.', '*', '+', '^', '$', '{', '}', '(', ')', '|', '[', '\\', ']'];

function toRegExp(str: string) {
	let regexpStr = '^';
	for (const char of str) {
		if (regExpSpecialChars.includes(char)) regexpStr += '\\' + char;
		else if (char === '?') regexpStr += '.';
		else regexpStr += char;
	}
	regexpStr += '$';
	return new RegExp(regexpStr, 's');
}

function toPattern(str: string) {
	const nodes: SimpleNode[] = [];
	const iter = new CharacterIterator(str);
	for (const char of iter) {
		if (char === CharacterCode.QuestionMark) {
			nodes.push({ kind: SyntaxKind.Wildcard });
		} else {
			if (nodes.length === 0 || nodes[nodes.length - 1].kind === SyntaxKind.Wildcard) {
				nodes.push({ kind: SyntaxKind.Literal, chars: [char] });
			} else {
				(nodes[nodes.length - 1] as LiteralNode).chars.push(char);
			}
		}
	}

	return nodes;
}
