[**obscenity**](../README.md)

***

[obscenity](../README.md) / grawlixCensorStrategy

# Function: grawlixCensorStrategy()

> **grawlixCensorStrategy**(): [`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Defined in: [src/censor/BuiltinStrategies.ts:89](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/censor/BuiltinStrategies.ts#L89)

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
