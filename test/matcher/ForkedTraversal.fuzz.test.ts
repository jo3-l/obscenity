import * as fc from 'fast-check';
import { ForkedTraversal, ForkedTraversalResponse } from '../../src/matcher/ForkedTraversal';
import { LiteralNode, SyntaxKind } from '../../src/pattern/Nodes';
import { SimpleNode } from '../../src/pattern/Simplifier';
import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

test('running the forked traversal to completion on a certain pattern and input should produce the same result as running an equivalent regexp on the input', () => {
	fc.assert(
		fc.property(
			fc.stringOf(fc.char()).filter((t) => t.length > 0),
			fc.stringOf(fc.char()).filter((t) => t.length > 0),
			(pat, input) => {
				const regexp = toRegExp(pat);
				const nodes = toPattern(pat);
				const traversal = new ForkedTraversal({
					patternId: -1,
					preFragmentMatchLength: 0,
					flags: 0,
					nodes,
				});

				let traversalMatched = false;
				outer: for (const char of new CharacterIterator(input)) {
					switch (traversal.consume(char)) {
						case ForkedTraversalResponse.FoundMatch:
							traversalMatched = true; // fall through
						case ForkedTraversalResponse.Destroy:
							break outer;
					}
				}

				return regexp.test(input) === traversalMatched;
			},
		),
	);
});

function toRegExp(str: string) {
	const clean = str.replace(/[.*+^${}()|[\]\\]/g, '\\%&');
	return new RegExp(`^${clean.replace(/\?/g, '.')}$`, 's');
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
