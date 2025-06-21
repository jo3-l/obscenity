[**obscenity**](../README.md)

***

[obscenity](../README.md) / remapCharactersTransformer

# Function: remapCharactersTransformer()

> **remapCharactersTransformer**(`mapping`): [`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

Defined in: [src/transformer/remap-characters/index.ts:38](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/transformer/remap-characters/index.ts#L38)

Maps certain characters to other characters, leaving other characters
unchanged.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain.

## Parameters

### mapping

[`CharacterMapping`](../type-aliases/CharacterMapping.md)

A map/object mapping certain characters to others.

## Returns

[`SimpleTransformerContainer`](../interfaces/SimpleTransformerContainer.md)

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

## Examples

```typescript
// Transform 'a' to 'b'.
const transformer = remapCharactersTransformer({ 'b': 'a' });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

```typescript
// Transform '🅱️' to 'b', and use a map instead of an object as the argument.
const transformer = remapCharactersTransformer(new Map([['b', '🅱️']]));
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

```typescript
// Transform '🇴' and '0' to 'o'.
const transformer = remapCharactersTransformer({ o: '🇴0' });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

## See

 - [[resolveConfusablesTransformer|  Transformer that handles confusable Unicode characters]]
 - [[resolveLeetSpeakTransformer | Transformer that handles leet-speak]]
