[obscenity](../README.md) / OptionalNode

# Interface: OptionalNode

An optional node.

## Table of contents

### Properties

- [childNode](OptionalNode.md#childnode)
- [kind](OptionalNode.md#kind)

## Properties

### childNode

• **childNode**: [`LiteralNode`](LiteralNode.md) \| [`WildcardNode`](WildcardNode.md)

The node contained within the optional expression. For `[abc]`, this
would be a literal node with the value `abc`.

#### Defined in

[src/pattern/Nodes.ts:44](https://github.com/jo3-l/obscenity/blob/faebf1f/src/pattern/Nodes.ts#L44)

___

### kind

• **kind**: [`Optional`](../enums/SyntaxKind.md#optional)

#### Defined in

[src/pattern/Nodes.ts:46](https://github.com/jo3-l/obscenity/blob/faebf1f/src/pattern/Nodes.ts#L46)
