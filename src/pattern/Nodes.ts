/**
 * A parsed pattern.
 */
export interface ParsedPattern {
	/**
	 * A list of nodes which make up the pattern.
	 */
	nodes: Node[];

	/**
	 * Whether the pattern requires a word boundary at the end.
	 */
	requireWordBoundaryAtEnd: boolean;

	/**
	 * Whether the pattern requires a word boundary at the start.
	 */
	requireWordBoundaryAtStart: boolean;
}

/**
 * All the possible kinds of nodes.
 */
export type Node = LiteralNode | OptionalNode | WildcardNode;

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
	/**
	 * The node contained within the optional expression. For `[abc]`, this
	 * would be a literal node with the value `abc`.
	 */
	childNode: LiteralNode | WildcardNode;

	kind: SyntaxKind.Optional;
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
	/**
	 * The code points that this literal matches.
	 */
	chars: number[];

	kind: SyntaxKind.Literal;
}

/**
 * A boundary assertion node.
 */
export interface BoundaryAssertionNode {
	kind: SyntaxKind.BoundaryAssertion;
}
