[obscenity](../README.md) / DataSet

# Class: DataSet<MetadataType\>

Holds phrases (groups of patterns and whitelisted terms), optionally
associating metadata with them.

## Type parameters

| Name | Description |
| :------ | :------ |
| `MetadataType` | Metadata type for phrases. Note that the metadata type is implicitly nullable. |

## Table of contents

### Constructors

- [constructor](DataSet.md#constructor)

### Properties

- [containers](DataSet.md#containers)
- [patternCount](DataSet.md#patterncount)
- [patternIdToPhraseOffset](DataSet.md#patternidtophraseoffset)

### Methods

- [addAll](DataSet.md#addall)
- [addPhrase](DataSet.md#addphrase)
- [build](DataSet.md#build)
- [getPayloadWithPhraseMetadata](DataSet.md#getpayloadwithphrasemetadata)
- [registerContainer](DataSet.md#registercontainer)
- [removePhrasesIf](DataSet.md#removephrasesif)

## Constructors

### constructor

• **new DataSet**<`MetadataType`\>()

#### Type parameters

| Name |
| :------ |
| `MetadataType` |

## Properties

### containers

• `Private` `Readonly` **containers**: [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>[] = `[]`

#### Defined in

[src/dataset/DataSet.ts:14](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L14)

___

### patternCount

• `Private` **patternCount**: `number` = `0`

#### Defined in

[src/dataset/DataSet.ts:15](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L15)

___

### patternIdToPhraseOffset

• `Private` `Readonly` **patternIdToPhraseOffset**: `Map`<`number`, `number`\>

#### Defined in

[src/dataset/DataSet.ts:16](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L16)

## Methods

### addAll

▸ **addAll**(`other`): [`DataSet`](DataSet.md)<`MetadataType`\>

Adds all the phrases from the dataset provided to this one.

**`example`**
```typescript
const customDataset = new DataSet().addAll(englishDataset);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`DataSet`](DataSet.md)<`MetadataType`\> | Other dataset. |

#### Returns

[`DataSet`](DataSet.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:28](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L28)

___

### addPhrase

▸ **addPhrase**(`fn`): [`DataSet`](DataSet.md)<`MetadataType`\>

Adds a phrase to this dataset.

**`example`**
```typescript
const data = new DataSet()
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'fuck' })
		.addPattern(pattern`fuck`)
		.addPattern(pattern`f[?]ck`)
		.addWhitelistedTerm('Afck'))
	.build();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`builder`: [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>) => [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\> | A function that takes a [PhraseBuilder](PhraseBuilder.md), adds patterns/whitelisted terms/metadata to it, and returns it. |

#### Returns

[`DataSet`](DataSet.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:75](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L75)

___

### build

▸ **build**(): `Pick`<[`PatternMatcherOptions`](../interfaces/PatternMatcherOptions.md), ``"blacklistedPatterns"`` \| ``"whitelistedTerms"``\>

Returns the dataset in a format suitable for usage with the [PatternMatcher](PatternMatcher.md).

**`example`**
```typescript
const matcher = new PatternMatcher({
	...dataset.build(),
	// your additional options here
});
```

#### Returns

`Pick`<[`PatternMatcherOptions`](../interfaces/PatternMatcherOptions.md), ``"blacklistedPatterns"`` \| ``"whitelistedTerms"``\>

#### Defined in

[src/dataset/DataSet.ts:118](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L118)

___

### getPayloadWithPhraseMetadata

▸ **getPayloadWithPhraseMetadata**(`payload`): [`MatchPayloadWithPhraseMetadata`](../interfaces/MatchPayloadWithPhraseMetadata.md)<`MetadataType`\>

Retrieves the phrase metadata associated with a pattern and returns a
copy of the match payload with said metadata attached to it.

**`example`**
```typescript
const matches = matcher.setInput(input).getAllMatches();
const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
// Now we can access the 'phraseMetadata' property:
const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`MatchPayload`](../interfaces/MatchPayload.md) | Original match payload. |

#### Returns

[`MatchPayloadWithPhraseMetadata`](../interfaces/MatchPayloadWithPhraseMetadata.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:95](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L95)

___

### registerContainer

▸ `Private` **registerContainer**(`container`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\> |

#### Returns

`void`

#### Defined in

[src/dataset/DataSet.ts:125](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L125)

___

### removePhrasesIf

▸ **removePhrasesIf**(`predicate`): [`DataSet`](DataSet.md)<`MetadataType`\>

Removes phrases that match the predicate given.

**`example`**
```typescript
const customDataset = new DataSet()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.displayName === 'fuck');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`phrase`: [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>) => `boolean` | A predicate that determines whether or not a phrase should be removed. Return `true` to remove, `false` to keep. |

#### Returns

[`DataSet`](DataSet.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:46](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/dataset/DataSet.ts#L46)
