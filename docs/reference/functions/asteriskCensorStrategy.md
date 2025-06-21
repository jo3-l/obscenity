[**obscenity**](../README.md)

***

[obscenity](../README.md) / asteriskCensorStrategy

# Function: asteriskCensorStrategy()

> **asteriskCensorStrategy**(): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:71](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/censor/BuiltinStrategies.ts#L71)

A text censoring strategy that generates strings made up of asterisks (`*`).

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Example

```typescript
const strategy = asteriskCensorStrategy();
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '**** you'
```
