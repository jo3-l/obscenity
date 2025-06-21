[**obscenity**](../README.md)

***

[obscenity](../README.md) / resolveLeetSpeakTransformer

# Function: resolveLeetSpeakTransformer()

> **resolveLeetSpeakTransformer**(): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/resolve-leetspeak/index.ts:23](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/transformer/resolve-leetspeak/index.ts#L23)

Creates a transformer that maps leet-speak characters to their normalized
equivalent. For example, `$` becomes `s` when using this transformer.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain, but after similar transformers that map characters to
other characters, such as the [[resolveConfusablesTransformer | transformer
that resolves confusable Unicode characters]].

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Example

```typescript
const transformer = resolveLeetSpeakTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
