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

### Properties

- [metadata](PhraseBuilder.md#metadata)
- [patterns](PhraseBuilder.md#patterns)
- [whitelistedTerms](PhraseBuilder.md#whitelistedterms)

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

## Properties

### metadata

• `Private` `Optional` **metadata**: `MetadataType`

#### Defined in

[src/dataset/DataSet.ts:140](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L140)

___

### patterns

• `Private` `Readonly` **patterns**: [`ParsedPattern`](../interfaces/ParsedPattern.md)[] = `[]`

#### Defined in

[src/dataset/DataSet.ts:138](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L138)

___

### whitelistedTerms

• `Private` `Readonly` **whitelistedTerms**: `string`[] = `[]`

#### Defined in

[src/dataset/DataSet.ts:139](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L139)

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

[src/dataset/DataSet.ts:147](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L147)

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

[src/dataset/DataSet.ts:157](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L157)

___

### build

▸ **build**(): [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

Builds the phrase, returning a [PhraseContainer](../interfaces/PhraseContainer.md) for use with the
[[Dataset]].

#### Returns

[`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:176](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L176)

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

[src/dataset/DataSet.ts:167](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L167)
