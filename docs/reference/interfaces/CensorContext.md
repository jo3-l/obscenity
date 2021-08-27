[obscenity](../README.md) / CensorContext

# Interface: CensorContext

Context passed to [text censoring strategies](../README.md#textcensorstrategy).

## Hierarchy

- [`MatchPayload`](MatchPayload.md)

  ↳ **`CensorContext`**

## Table of contents

### Properties

- [endIndex](CensorContext.md#endindex)
- [input](CensorContext.md#input)
- [matchLength](CensorContext.md#matchlength)
- [overlapsAtEnd](CensorContext.md#overlapsatend)
- [overlapsAtStart](CensorContext.md#overlapsatstart)
- [startIndex](CensorContext.md#startindex)
- [termId](CensorContext.md#termid)

## Properties

### endIndex

• **endIndex**: `number`

End index of the match, inclusive.

If the last character of the pattern is a surrogate pair,
then this points to the index of the low surrogate.

#### Inherited from

[MatchPayload](MatchPayload.md).[endIndex](MatchPayload.md#endindex)

#### Defined in

[src/matcher/MatchPayload.ts:31](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/matcher/MatchPayload.ts#L31)

___

### input

• **input**: `string`

The entire input text, without any censoring applied to it.

#### Defined in

[src/censor/TextCensor.ts:108](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/censor/TextCensor.ts#L108)

___

### matchLength

• **matchLength**: `number`

Total number of of code points that matched.

#### Inherited from

[MatchPayload](MatchPayload.md).[matchLength](MatchPayload.md#matchlength)

#### Defined in

[src/matcher/MatchPayload.ts:18](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/matcher/MatchPayload.ts#L18)

___

### overlapsAtEnd

• **overlapsAtEnd**: `boolean`

Whether the current region overlaps at the end with some other region.

#### Defined in

[src/censor/TextCensor.ts:118](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/censor/TextCensor.ts#L118)

___

### overlapsAtStart

• **overlapsAtStart**: `boolean`

Whether the current region overlaps at the start with some other region.

#### Defined in

[src/censor/TextCensor.ts:113](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/censor/TextCensor.ts#L113)

___

### startIndex

• **startIndex**: `number`

Start index of the match, inclusive.

#### Inherited from

[MatchPayload](MatchPayload.md).[startIndex](MatchPayload.md#startindex)

#### Defined in

[src/matcher/MatchPayload.ts:23](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/matcher/MatchPayload.ts#L23)

___

### termId

• **termId**: `number`

ID of the blacklisted term that matched.

#### Inherited from

[MatchPayload](MatchPayload.md).[termId](MatchPayload.md#termid)

#### Defined in

[src/matcher/MatchPayload.ts:13](https://github.com/jo3-l/obscenity/blob/81e1bc5/src/matcher/MatchPayload.ts#L13)
