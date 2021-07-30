export interface ParsedPattern {
	requireWordBoundaryAtStart: boolean;
	requireWordBoundaryAtEnd: boolean;
	nodes: Node[];
}

export type Node = OptionalNode | WildcardNode | LiteralNode;

export const enum SyntaxKind {
	Optional,
	Wildcard,
	Literal,
	BoundaryAssertion,
}

export interface OptionalNode {
	kind: SyntaxKind.Optional;
	childNode: LiteralNode | WildcardNode;
}

export interface WildcardNode {
	kind: SyntaxKind.Wildcard;
}

export interface LiteralNode {
	kind: SyntaxKind.Literal;
	chars: number[];
}

export interface BoundaryAssertionNode {
	kind: SyntaxKind.BoundaryAssertion;
}
