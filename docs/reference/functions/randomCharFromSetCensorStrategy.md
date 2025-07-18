[**obscenity**](../README.md)

***

[obscenity](../README.md) / randomCharFromSetCensorStrategy

# Function: randomCharFromSetCensorStrategy()

> **randomCharFromSetCensorStrategy**(`charset`): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:156](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/censor/BuiltinStrategies.ts#L156)

A text censoring strategy that generates replacement strings made up of
random characters from the set of characters provided. The strings never
contain two of the same character in a row.

## Parameters

### charset

`string`

Set of characters from which the replacement string should
be constructed. Must have at least two characters.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Example

```typescript
const strategy = randomCharFromSetCensorStrategy('$#!');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you!'
// After: '!#$# you!'
```
