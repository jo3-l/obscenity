[obscenity](../README.md) / MatchPayloadWithPhraseMetadata

# Interface: MatchPayloadWithPhraseMetadata<MetadataType\>

Extends the default match payload by adding phrase metadata.

## Type parameters

| Name |
| :------ |
| `MetadataType` |

## Hierarchy

- [`MatchPayload`](MatchPayload.md)

  ↳ **`MatchPayloadWithPhraseMetadata`**

## Table of contents

### Properties

- [endIndex](MatchPayloadWithPhraseMetadata.md#endindex)
- [matchLength](MatchPayloadWithPhraseMetadata.md#matchlength)
- [phraseMetadata](MatchPayloadWithPhraseMetadata.md#phrasemetadata)
- [startIndex](MatchPayloadWithPhraseMetadata.md#startindex)
- [termId](MatchPayloadWithPhraseMetadata.md#termid)

## Properties

### endIndex

• **endIndex**: `number`

End index of the match, inclusive.

If the last character of the pattern is a surrogate pair,
then this points to the index of the low surrogate.

#### Inherited from

[MatchPayload](MatchPayload.md).[endIndex](MatchPayload.md#endindex)

#### Defined in

[src/matcher/MatchPayload.ts:31](https://github.com/jo3-l/obscenity/blob/79cfa63/src/matcher/MatchPayload.ts#L31)

___

### matchLength

• **matchLength**: `number`

Total number of of code points that matched.

#### Inherited from

[MatchPayload](MatchPayload.md).[matchLength](MatchPayload.md#matchlength)

#### Defined in

[src/matcher/MatchPayload.ts:18](https://github.com/jo3-l/obscenity/blob/79cfa63/src/matcher/MatchPayload.ts#L18)

___

### phraseMetadata

• `Optional` **phraseMetadata**: `MetadataType`

Phrase metadata associated with the pattern that matched.

#### Defined in

[src/dataset/DataSet.ts:203](https://github.com/jo3-l/obscenity/blob/79cfa63/src/dataset/DataSet.ts#L203)

___

### startIndex

• **startIndex**: `number`

Start index of the match, inclusive.

#### Inherited from

[MatchPayload](MatchPayload.md).[startIndex](MatchPayload.md#startindex)

#### Defined in

[src/matcher/MatchPayload.ts:23](https://github.com/jo3-l/obscenity/blob/79cfa63/src/matcher/MatchPayload.ts#L23)

___

### termId

• **termId**: `number`

ID of the blacklisted term that matched.

#### Inherited from

[MatchPayload](MatchPayload.md).[termId](MatchPayload.md#termid)

#### Defined in

[src/matcher/MatchPayload.ts:13](https://github.com/jo3-l/obscenity/blob/79cfa63/src/matcher/MatchPayload.ts#L13)
