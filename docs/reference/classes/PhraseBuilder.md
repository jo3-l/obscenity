[obscenity](../README.md) / PhraseBuilder

# Class: PhraseBuilder<MetadataType\>

Builder for phrases.

## Type parameters

| Name |
| :------ |
| `MetadataType` |

## Table of contents

### Constructors

- [constructor](PhraseBuilder.md#constructor)

### Methods

- [addPattern](PhraseBuilder.md#addpattern)
- [addWhitelistedTerm](PhraseBuilder.md#addwhitelistedterm)
- [build](PhraseBuilder.md#build)
- [setMetadata](PhraseBuilder.md#setmetadata)

## Constructors

### constructor

• **new PhraseBuilder**<`MetadataType`\>()

#### Type parameters

| Name |
| :------ |
| `MetadataType` |

## Methods

### addPattern

▸ **addPattern**(`pattern`): [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

Associates a pattern with this phrase.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pattern` | [`ParsedPattern`](../interfaces/ParsedPattern.md) | Pattern to add. |

#### Returns

[`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:149](https://github.com/jo3-l/obscenity/blob/da754da/src/dataset/DataSet.ts#L149)

___

### addWhitelistedTerm

▸ **addWhitelistedTerm**(`term`): [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

Associates a whitelisted pattern with this phrase.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `term` | `string` | Whitelisted term to add. |

#### Returns

[`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:159](https://github.com/jo3-l/obscenity/blob/da754da/src/dataset/DataSet.ts#L159)

___

### build

▸ **build**(): [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

Builds the phrase, returning a [[PhraseContainer]] for use with the
[[DataSet]].

#### Returns

[`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:178](https://github.com/jo3-l/obscenity/blob/da754da/src/dataset/DataSet.ts#L178)

___

### setMetadata

▸ **setMetadata**(`metadata?`): [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

Associates some metadata with this phrase.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `metadata?` | `MetadataType` | Metadata to use. |

#### Returns

[`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:169](https://github.com/jo3-l/obscenity/blob/da754da/src/dataset/DataSet.ts#L169)
