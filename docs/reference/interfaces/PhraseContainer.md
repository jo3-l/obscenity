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

[src/dataset/DataSet.ts:223](https://github.com/jo3-l/obscenity/blob/9aba3bc/src/dataset/DataSet.ts#L223)

___

### patterns

• **patterns**: [`ParsedPattern`](ParsedPattern.md)[]

Patterns associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:213](https://github.com/jo3-l/obscenity/blob/9aba3bc/src/dataset/DataSet.ts#L213)

___

### whitelistedTerms

• **whitelistedTerms**: `string`[]

Whitelisted terms associated with this phrase.

#### Defined in

[src/dataset/DataSet.ts:218](https://github.com/jo3-l/obscenity/blob/9aba3bc/src/dataset/DataSet.ts#L218)
