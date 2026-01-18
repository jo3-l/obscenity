[**obscenity**](../README.md)

***

[obscenity](../README.md) / keepStartCensorStrategy

# Function: keepStartCensorStrategy()

> **keepStartCensorStrategy**(`baseStrategy`): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:28](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/censor/BuiltinStrategies.ts#L28)

A text censoring strategy that extends another strategy, adding the first
character matched at the start of the generated string.

## Parameters

### baseStrategy

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Strategy to extend. It will be used to produce the end of
the generated string.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Examples

```typescript
const strategy = keepStartCensorStrategy(grawlixCensorStrategy());
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'f$@* you'
```

```typescript
// Since keepEndCensorStrategy() returns another text censoring strategy, you can use it
// as the base strategy to pass to keepStartCensorStrategy().
const strategy = keepStartCensorStrategy(keepEndCensorStrategy(asteriskCensorStrategy()));
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'f**k you'
```
