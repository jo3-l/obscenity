/**
 * A parsed pattern.
 */
export interface ParsedPattern {
	/**
	 * Whether the pattern requires a word boundary at the start.
	 */
	requireWordBoundaryAtStart: boolean;

	/**
	 * Whether the pattern requires a word boundary at the end.
	 */
	requireWordBoundaryAtEnd: boolean;

	/**
	 * A list of nodes which make up the pattern.
	 */
	nodes: Node[];
}

/**
 * All the possible kinds of nodes.
 */
export type Node = OptionalNode | WildcardNode | LiteralNode;

/**
 * An enumeration of the kinds of nodes there are.
 */
export enum SyntaxKind {
	Optional,
	Wildcard,
	Literal,
	BoundaryAssertion,
}

/**
 * An optional node.
 */
export interface OptionalNode {
	kind: SyntaxKind.Optional;

	/**
	 * The node contained within the optional expression. For `[abc]`, this
	 * would be a literal node with the value `abc`.
	 */
	childNode: LiteralNode | WildcardNode;
}

/**
 * A wildcard node.
 */
export interface WildcardNode {
	kind: SyntaxKind.Wildcard;
}

/**
 * A literal node.
 */
export interface LiteralNode {
	kind: SyntaxKind.Literal;

	/**
	 * The code points that this literal matches.
	 */
	chars: number[];
}

/**
 * A boundary assertion node.
 */
export interface BoundaryAssertionNode {
	kind: SyntaxKind.BoundaryAssertion;
}
