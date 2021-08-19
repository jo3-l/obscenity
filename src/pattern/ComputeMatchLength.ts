import { SyntaxKind } from './Nodes';
import type { SimpleNode } from './Simplifier';

export function computePatternMatchLength(nodes: SimpleNode[]) {
	return nodes.reduce((total, node) => total + (node.kind === SyntaxKind.Wildcard ? 1 : node.chars.length), 0);
}
