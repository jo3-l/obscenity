[**obscenity**](../README.md)

***

[obscenity](../README.md) / MatchPayload

# Interface: MatchPayload

Defined in: [src/matcher/MatchPayload.ts:9](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/MatchPayload.ts#L9)

Information emitted on a successful match.

If you require more information about matches than what is provided here, see
the [[DataSet]] class, which supports associating metadata with patterns.

## Properties

### endIndex

> **endIndex**: `number`

Defined in: [src/matcher/MatchPayload.ts:16](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/MatchPayload.ts#L16)

End index of the match, inclusive.

If the last character of the pattern is a surrogate pair,
then this points to the index of the low surrogate.

***

### matchLength

> **matchLength**: `number`

Defined in: [src/matcher/MatchPayload.ts:21](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/MatchPayload.ts#L21)

Total number of of code points that matched.

***

### startIndex

> **startIndex**: `number`

Defined in: [src/matcher/MatchPayload.ts:26](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/MatchPayload.ts#L26)

Start index of the match, inclusive.

***

### termId

> **termId**: `number`

Defined in: [src/matcher/MatchPayload.ts:31](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/MatchPayload.ts#L31)

ID of the blacklisted term that matched.
