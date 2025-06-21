[**obscenity**](../README.md)

***

[obscenity](../README.md) / fixedPhraseCensorStrategy

# Function: fixedPhraseCensorStrategy()

> **fixedPhraseCensorStrategy**(`phrase`): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:115](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/censor/BuiltinStrategies.ts#L115)

A text censoring strategy that returns a fixed string.

## Parameters

### phrase

`string`

Replacement phrase to use.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Examples

```typescript
// The replacement phrase '' effectively removes all matched regions
// from the string.
const strategy = fixedPhraseCensorStrategy('');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: ' you'
```

```typescript
const strategy = fixedPhraseCensorStrategy('fudge');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'fudge you'
```
