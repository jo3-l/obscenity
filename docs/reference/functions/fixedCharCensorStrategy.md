[**obscenity**](../README.md)

***

[obscenity](../README.md) / fixedCharCensorStrategy

# Function: fixedCharCensorStrategy()

> **fixedCharCensorStrategy**(`char`): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:134](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/censor/BuiltinStrategies.ts#L134)

A text censoring strategy that generates replacement strings that are made up
of the character given, repeated as many times as needed.

## Parameters

### char

`string`

String that represents the code point which should be used when
generating the replacement string. Must be exactly one code point in length.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Example

```typescript
const strategy = fixedCharCensorStrategy('*');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '**** you'.
```
