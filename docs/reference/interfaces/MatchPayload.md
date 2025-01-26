[obscenity](../README.md) / MatchPayload

# Interface: MatchPayload

Information emitted on a successful match.

If you require more information about matches than what is provided here, see
the [[DataSet]] class, which supports associating metadata with patterns.

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

[src/matcher/MatchPayload.ts:16](https://github.com/jo3-l/obscenity/blob/0299b49/src/matcher/MatchPayload.ts#L16)

___

### matchLength

• **matchLength**: `number`

Total number of of code points that matched.

#### Defined in

[src/matcher/MatchPayload.ts:21](https://github.com/jo3-l/obscenity/blob/0299b49/src/matcher/MatchPayload.ts#L21)

___

### startIndex

• **startIndex**: `number`

Start index of the match, inclusive.

#### Defined in

[src/matcher/MatchPayload.ts:26](https://github.com/jo3-l/obscenity/blob/0299b49/src/matcher/MatchPayload.ts#L26)

___

### termId

• **termId**: `number`

ID of the blacklisted term that matched.

#### Defined in

[src/matcher/MatchPayload.ts:31](https://github.com/jo3-l/obscenity/blob/0299b49/src/matcher/MatchPayload.ts#L31)
