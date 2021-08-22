import type { LiteralNode } from './Nodes';
import { SyntaxKind } from './Nodes';
import type { SimpleNode } from './Simplifier';

export function computePatternMatchLength(nodes: SimpleNode[]) {
	return nodes.reduce((total, node) => total + (node.kind === SyntaxKind.Wildcard ? 1 : node.chars.length), 0);
}

export function groupByNodeType(nodes: SimpleNode[]) {
	let i = 0;
	const groups: NodeGroup[] = [];
	while (i < nodes.length) {
		const node = nodes[i];
		if (node.kind === SyntaxKind.Literal) {
			const literals: LiteralNode[] = [];
			while (i < nodes.length && nodes[i].kind === SyntaxKind.Literal) literals.push(nodes[i++] as LiteralNode);
			groups.push({ literals, isLiteralGroup: true });
		} else {
			const mark = i;
			while (i < nodes.length && nodes[i].kind === SyntaxKind.Wildcard) i++;
			groups.push({ wildcardCount: i - mark, isLiteralGroup: false });
		}
	}

	return groups;
}

export type NodeGroup = LiteralGroup | WildcardGroup;

export interface LiteralGroup {
	isLiteralGroup: true;
	literals: LiteralNode[];
}

export interface WildcardGroup {
	isLiteralGroup: false;
	wildcardCount: number;
}
