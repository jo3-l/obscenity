[**obscenity**](../README.md)

***

[obscenity](../README.md) / PhraseBuilder

# Class: PhraseBuilder\<MetadataType\>

Defined in: [src/dataset/DataSet.ts:137](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/dataset/DataSet.ts#L137)

Builder for phrases.

## Type Parameters

### MetadataType

`MetadataType`

## Constructors

### Constructor

> **new PhraseBuilder**\<`MetadataType`\>(): `PhraseBuilder`\<`MetadataType`\>

#### Returns

`PhraseBuilder`\<`MetadataType`\>

## Methods

### addPattern()

> **addPattern**(`pattern`): `PhraseBuilder`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:149](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/dataset/DataSet.ts#L149)

Associates a pattern with this phrase.

#### Parameters

##### pattern

[`ParsedPattern`](../interfaces/ParsedPattern.md)

Pattern to add.

#### Returns

`PhraseBuilder`\<`MetadataType`\>

***

### addWhitelistedTerm()

> **addWhitelistedTerm**(`term`): `PhraseBuilder`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:159](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/dataset/DataSet.ts#L159)

Associates a whitelisted pattern with this phrase.

#### Parameters

##### term

`string`

Whitelisted term to add.

#### Returns

`PhraseBuilder`\<`MetadataType`\>

***

### build()

> **build**(): [`PhraseContainer`](../interfaces/PhraseContainer.md)\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:178](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/dataset/DataSet.ts#L178)

Builds the phrase, returning a [[PhraseContainer]] for use with the
[[DataSet]].

#### Returns

[`PhraseContainer`](../interfaces/PhraseContainer.md)\<`MetadataType`\>

***

### setMetadata()

> **setMetadata**(`metadata?`): `PhraseBuilder`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:169](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/dataset/DataSet.ts#L169)

Associates some metadata with this phrase.

#### Parameters

##### metadata?

`MetadataType`

Metadata to use.

#### Returns

`PhraseBuilder`\<`MetadataType`\>
