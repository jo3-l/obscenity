[**obscenity**](../README.md)

***

[obscenity](../README.md) / CensorContext

# Type Alias: CensorContext

> **CensorContext** = [`MatchPayload`](../interfaces/MatchPayload.md) & `object`

Defined in: [src/censor/TextCensor.ts:104](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/censor/TextCensor.ts#L104)

Context passed to [[TextCensorStrategy | text censoring strategies]].

## Type declaration

### input

> **input**: `string`

The entire input text, without any censoring applied to it.

### overlapsAtEnd

> **overlapsAtEnd**: `boolean`

Whether the current region overlaps at the end with some other region.

### overlapsAtStart

> **overlapsAtStart**: `boolean`

Whether the current region overlaps at the start with some other region.
