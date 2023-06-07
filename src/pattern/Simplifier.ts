import type { LiteralNode, Node, WildcardNode } from './Nodes';
import { SyntaxKind } from './Nodes';

export type SimpleNode = LiteralNode | WildcardNode;

// Returns a list of patterns using simple constructs that match the same set of strings
// as the original pattern.
export function simplify(nodes: Node[]) {
	const result: SimpleNode[][] = [[]];
	for (const node of nodes) {
		if (node.kind === SyntaxKind.Optional) {
			// Given the pattern [p1, p2, p3, ..., pm] where p1, p2, p3, etc., are
			// wildcard / literal nodes and pm is an optional node, we can
			// simplify it to two patterns (one where the optional node exists,
			// and one where it does not):
			// 	[p1, p2, p3, ..., pm-1], [p1, p2, p3, ..., pm]
			//
			// If there are multiple optional nodes, the idea is the same; we
			// "fork" the pattern whenever we find an optional node and
			// continue doing so until all nodes have been handled.
			//
			// N.B.: This technique results in the number of simplified patterns
			// growing exponentially, as having two possibilities at each
			// optional node results in 2^n patterns where n is the number of
			// optional nodes. However, in practice, this is unlikely to be an
			// issue.
			const mark = result.length;
			for (let i = 0; i < mark; i++) {
				const pre = result[i];
				result.push([...pre, node.childNode]);
			}
		} else {
			for (const nodes of result) nodes.push(node);
		}
	}

	return result.map(mergeLiteralNodeRuns);
}

function mergeLiteralNodeRuns(nodes: SimpleNode[]) {
	const merged: SimpleNode[] = [];
	let i = 0;
	while (i < nodes.length) {
		const node = nodes[i++];
		if (node.kind !== SyntaxKind.Literal) {
			merged.push(node);
			continue;
		}

		// Find all literal nodes right after the current one, and merge their content.
		const chars = [...node.chars];
		while (i < nodes.length && nodes[i].kind === SyntaxKind.Literal) {
			chars.push(...(nodes[i++] as LiteralNode).chars);
		}

		merged.push({ kind: SyntaxKind.Literal, chars });
	}

	return merged;
}
