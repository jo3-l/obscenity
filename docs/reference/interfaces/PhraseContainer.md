[obscenity](../README.md) / PhraseContainer

# Interface: PhraseContainer<MetadataType\>

Represents a phrase.

## Type parameters

| Name |
| :------ |
| `MetadataType` |

## Table of contents

### Properties

- [metadata](PhraseContainer.md#metadata)
- [patterns](PhraseContainer.md#patterns)
- [whitelistedTerms](PhraseContainer.md#whitelistedterms)

## Properties

### metadata

• `Optional` **metadata**: `MetadataType`

Metadata associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:204](https://github.com/jo3-l/obscenity/blob/faebf1f/src/dataset/DataSet.ts#L204)

___

### patterns

• **patterns**: [`ParsedPattern`](ParsedPattern.md)[]

Patterns associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:209](https://github.com/jo3-l/obscenity/blob/faebf1f/src/dataset/DataSet.ts#L209)

___

### whitelistedTerms

• **whitelistedTerms**: `string`[]

Whitelisted terms associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:214](https://github.com/jo3-l/obscenity/blob/faebf1f/src/dataset/DataSet.ts#L214)
