[**obscenity**](../README.md)

***

[obscenity](../README.md) / OptionalNode

# Interface: OptionalNode

Defined in: [src/pattern/Nodes.ts:39](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/pattern/Nodes.ts#L39)

An optional node.

## Properties

### childNode

> **childNode**: [`LiteralNode`](LiteralNode.md) \| [`WildcardNode`](WildcardNode.md)

Defined in: [src/pattern/Nodes.ts:44](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/pattern/Nodes.ts#L44)

The node contained within the optional expression. For `[abc]`, this
would be a literal node with the value `abc`.

***

### kind

> **kind**: [`Optional`](../enumerations/SyntaxKind.md#optional)

Defined in: [src/pattern/Nodes.ts:46](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/pattern/Nodes.ts#L46)
