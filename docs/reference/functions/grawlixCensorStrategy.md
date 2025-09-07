[**obscenity**](../README.md)

***

[obscenity](../README.md) / grawlixCensorStrategy

# Function: grawlixCensorStrategy()

> **grawlixCensorStrategy**(): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:89](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/censor/BuiltinStrategies.ts#L89)

A text censoring strategy that generates
[grawlix](https://www.merriam-webster.com/words-at-play/grawlix-symbols-swearing-comic-strips),
i.e. strings that contain the characters `%`, `@`, `$`, `&`, and `*`.

## Returns

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

## Example

```typescript
const strategy = grawlixCensorStrategy();
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '%@&* you'
```
