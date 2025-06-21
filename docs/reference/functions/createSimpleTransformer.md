[**obscenity**](../README.md)

***

[obscenity](../README.md) / createSimpleTransformer

# Function: createSimpleTransformer()

> **createSimpleTransformer**(`transformer`): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/Transformers.ts:45](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/transformer/Transformers.ts#L45)

Creates a container holding the transformer function provided. Simple
transformers are suitable for stateless transformations, e.g., a
transformation that maps certain characters to others. For transformations
that need to keep around state, see `createStatefulTransformer`.

## Parameters

### transformer

[`TransformerFn`](../type-aliases/TransformerFn.md)

Function that applies the transformation. It should
accept one argument, the input character, and return the transformed
character. A return value of `undefined` indicates that the character should
be ignored.

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Examples

```typescript
function lowercaseToUppercase(char) {
 return isLowercase(char) ? char - 32 : char;
}

const transformer = createSimpleTransformer(lowercaseToUppercase);
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

```typescript
function ignoreAllNonDigitChars(char) {
 return isDigit(char) ? char : undefined;
}

const transformer = createSimpleTransformer(ignoreAllNonDigitChars);
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
