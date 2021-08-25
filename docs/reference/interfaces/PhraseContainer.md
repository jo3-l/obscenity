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

[src/dataset/DataSet.ts:212](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/dataset/DataSet.ts#L212)

___

### patterns

• **patterns**: [`ParsedPattern`](ParsedPattern.md)[]

Patterns associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:202](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/dataset/DataSet.ts#L202)

___

### whitelistedTerms

• **whitelistedTerms**: `string`[]

Whitelisted terms associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:207](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/dataset/DataSet.ts#L207)
