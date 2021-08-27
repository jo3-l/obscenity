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

[src/dataset/DataSet.ts:158](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/dataset/DataSet.ts#L158)

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

[src/dataset/DataSet.ts:168](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/dataset/DataSet.ts#L168)

___

### build

▸ **build**(): [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

Builds the phrase, returning a [PhraseContainer](../interfaces/PhraseContainer.md) for use with the
[DataSet](DataSet.md).

#### Returns

[`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:187](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/dataset/DataSet.ts#L187)

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

[src/dataset/DataSet.ts:178](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/dataset/DataSet.ts#L178)
