[**obscenity**](../README.md)

***

[obscenity](../README.md) / keepEndCensorStrategy

# Function: keepEndCensorStrategy()

> **keepEndCensorStrategy**(`baseStrategy`): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:51](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/censor/BuiltinStrategies.ts#L51)

A text censoring strategy that extends another strategy, adding the last
character matched at the end of the generated string.

## Parameters

### baseStrategy

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Strategy to extend. It will be used to produce the start
of the generated string.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Example

```typescript
const strategy = keepEndCensorStrategy(asteriskCensorStrategy());
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '***k you'
```
