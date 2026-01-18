[**obscenity**](../README.md)

***

[obscenity](../README.md) / collapseDuplicatesTransformer

# Function: collapseDuplicatesTransformer()

> **collapseDuplicatesTransformer**(`options`): [`StatefulTransformerContainer`](../interfaces/StatefulTransformerContainer.md)

Defined in: [src/transformer/collapse-duplicates/index.ts:46](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/transformer/collapse-duplicates/index.ts#L46)

Creates a transformer that collapses duplicate characters. This is useful for
detecting variants of patterns in which a character is repeated to bypass
detection.

As an example, the pattern `hi` does not match `hhiii` by default, as the
frequency of the characters does not match. With this transformer, `hhiii`
would become `hi`, and would therefore match the pattern.

**Application order**

It is recommended that this transformer be applied after all other
transformers. Using it before other transformers may have the effect of not
catching duplicates of certain characters that were originally different but
became the same after a series of transformations.

**Warning**

This transformer should be used with caution, as while it can make certain
patterns match text that wouldn't have been matched before, it can also go
the other way. For example, the pattern `hello` clearly matches `hello`, but
with this transformer, by default, `hello` would become `helo` which does
_not_ match. In this cases, the `customThresholds` option can be used to
allow two `l`s in a row, making it leave `hello` unchanged.

## Parameters

### options

[`CollapseDuplicatesTransformerOptions`](../interfaces/CollapseDuplicatesTransformerOptions.md) = `{}`

Options for the transformer.

## Returns

[`StatefulTransformerContainer`](../interfaces/StatefulTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Examples

```typescript
// Collapse runs of the same character.
const transformer = collapseDuplicatesTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

```typescript
// Collapse runs of characters other than 'a'.
const transformer = collapseDuplicatesTransformer({ customThresholds: new Map([['a', Infinity]]) });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
