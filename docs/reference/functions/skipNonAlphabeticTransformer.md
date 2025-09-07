[**obscenity**](../README.md)

***

[obscenity](../README.md) / skipNonAlphabeticTransformer

# Function: skipNonAlphabeticTransformer()

> **skipNonAlphabeticTransformer**(): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/skip-non-alphabetic/index.ts:31](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/transformer/skip-non-alphabetic/index.ts#L31)

Creates a transformer that skips non-alphabetic characters (`a`-`z`,
`A`-`Z`). This is useful when matching text on patterns that are solely
comprised of alphabetic characters (the pattern `hello` does not match
`h.e.l.l.o` by default, but does with this transformer).

**Warning**

This transformation is not part of the default set of transformations, as
there are some known rough edges with false negatives; see
[#23](https://github.com/jo3-l/obscenity/issues/23) and
[#46](https://github.com/jo3-l/obscenity/issues/46) on the GitHub issue
tracker.

**Application order**

It is recommended that this transformer be applied near the end of the
transformer chain, if at all.

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Example

```typescript
const transformer = skipNonAlphabeticTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
