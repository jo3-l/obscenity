[**obscenity**](../README.md)

***

[obscenity](../README.md) / createStatefulTransformer

# Function: createStatefulTransformer()

> **createStatefulTransformer**(`factory`): [`StatefulTransformerContainer`](../interfaces/StatefulTransformerContainer.md)

Defined in: [src/transformer/Transformers.ts:100](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/transformer/Transformers.ts#L100)

Creates a container holding the stateful transformer. Stateful transformers
are objects which satisfy the `StatefulTransformer` interface. They are
suitable for transformations that require keeping around some state regarding
the characters previously transformed in the text.

## Parameters

### factory

[`StatefulTransformerFactory`](../type-aliases/StatefulTransformerFactory.md)

A function that returns an instance of the stateful
transformer.

## Returns

[`StatefulTransformerContainer`](../interfaces/StatefulTransformerContainer.md)

A container holding the stateful transformer, which can then be
passed to the [[RegExpMatcher]].

## Example

```typescript
class IgnoreDuplicateCharactersTransformer implements StatefulTransformer {
 private lastChar = -1;

 public transform(char: number) {
     if (char === this.lastChar) return undefined;
     this.lastChar = char;
     return char;
 }

 public reset() {
     this.lastChar = -1;
 }
}

const transformer = createStatefulTransformer(() => new IgnoreDuplicateCharactersTransformer());
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```
