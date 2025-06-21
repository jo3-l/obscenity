[**obscenity**](../README.md)

***

[obscenity](../README.md) / resolveConfusablesTransformer

# Function: resolveConfusablesTransformer()

> **resolveConfusablesTransformer**(): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/resolve-confusables/index.ts:22](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/transformer/resolve-confusables/index.ts#L22)

Creates a transformer that maps confusable Unicode characters to their
normalized equivalent. For example, `⓵`, `➊`, and `⑴` become `1` when using
this transformer.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain.

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Example

```typescript
const transformer = resolveConfusablesTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
