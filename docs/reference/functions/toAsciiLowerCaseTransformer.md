[**obscenity**](../README.md)

***

[obscenity](../README.md) / toAsciiLowerCaseTransformer

# Function: toAsciiLowerCaseTransformer()

> **toAsciiLowerCaseTransformer**(): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/to-ascii-lowercase/index.ts:18](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/transformer/to-ascii-lowercase/index.ts#L18)

Creates a transformer that changes all ASCII alphabet characters to
lower-case, leaving other characters unchanged.

**Application order**

It is recommended that this transformer be applied near the end of the
transformer chain. Using it before other transformers may have the effect of
making its changes useless as transformers applied after produce characters
of varying cases.

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].
