[obscenity](../README.md) / MatchPayload

# Interface: MatchPayload

Data emitted by the pattern matcher on a successful match.

If you require more information about matches than what is provided here, see
the [DataSet](../classes/DataSet.md) class, which permits one to associate metadata with patterns.

## Hierarchy

- **`MatchPayload`**

  ↳ [`CensorContext`](CensorContext.md)

  ↳ [`MatchPayloadWithPhraseMetadata`](MatchPayloadWithPhraseMetadata.md)

## Table of contents

### Properties

- [endIndex](MatchPayload.md#endindex)
- [matchLength](MatchPayload.md#matchlength)
- [startIndex](MatchPayload.md#startindex)
- [termId](MatchPayload.md#termid)

## Properties

### endIndex

• **endIndex**: `number`

End index of the match, inclusive.

If the last character of the pattern is a surrogate pair,
then this points to the index of the low surrogate.

#### Defined in

[src/matcher/MatchPayload.ts:31](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/MatchPayload.ts#L31)

___

### matchLength

• **matchLength**: `number`

Total number of of code points that matched.

#### Defined in

[src/matcher/MatchPayload.ts:18](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/MatchPayload.ts#L18)

___

### startIndex

• **startIndex**: `number`

Start index of the match, inclusive.

#### Defined in

[src/matcher/MatchPayload.ts:23](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/MatchPayload.ts#L23)

___

### termId

• **termId**: `number`

ID of the blacklisted term that matched.

#### Defined in

[src/matcher/MatchPayload.ts:13](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/MatchPayload.ts#L13)
