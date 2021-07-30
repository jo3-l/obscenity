import { SimpleNode } from './Simplifier';
import { SyntaxKind } from './Nodes';

export function computePatternMatchLength(nodes: SimpleNode[]) {
	return nodes.reduce((total, node) => total + (node.kind === SyntaxKind.Wildcard ? 1 : node.chars.length), 0);
}
