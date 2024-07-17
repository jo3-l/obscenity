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

### Methods

- [addAll](DataSet.md#addall)
- [addPhrase](DataSet.md#addphrase)
- [build](DataSet.md#build)
- [getPayloadWithPhraseMetadata](DataSet.md#getpayloadwithphrasemetadata)
- [removePhrasesIf](DataSet.md#removephrasesif)

## Constructors

### constructor

• **new DataSet**<`MetadataType`\>()

#### Type parameters

| Name |
| :------ |
| `MetadataType` |

## Methods

### addAll

▸ **addAll**(`other`): [`DataSet`](DataSet.md)<`MetadataType`\>

Adds all the phrases from the dataset provided to this one.

**`Example`**

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

[src/dataset/DataSet.ts:29](https://github.com/jo3-l/obscenity/blob/37976b6/src/dataset/DataSet.ts#L29)

___

### addPhrase

▸ **addPhrase**(`fn`): [`DataSet`](DataSet.md)<`MetadataType`\>

Adds a phrase to this dataset.

**`Example`**

```typescript
const data = new DataSet<{ originalWord: string }>()
	.addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fuck' })
		.addPattern(pattern`fuck`)
		.addPattern(pattern`f[?]ck`)
		.addWhitelistedTerm('Afck'))
	.build();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | (`builder`: [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\>) => [`PhraseBuilder`](PhraseBuilder.md)<`MetadataType`\> | A function that takes a [[PhraseBuilder]], adds patterns/whitelisted terms/metadata to it, and returns it. |

#### Returns

[`DataSet`](DataSet.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:75](https://github.com/jo3-l/obscenity/blob/37976b6/src/dataset/DataSet.ts#L75)

___

### build

▸ **build**(): `Pick`<[`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md), ``"blacklistedTerms"`` \| ``"whitelistedTerms"``\>

Returns the dataset in a format suitable for usage with the [[RegExpMatcher]].

**`Example`**

```typescript
// With the RegExpMatcher:
const matcher = new RegExpMatcher({
	...dataset.build(),
	// additional options here
});
```

#### Returns

`Pick`<[`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md), ``"blacklistedTerms"`` \| ``"whitelistedTerms"``\>

#### Defined in

[src/dataset/DataSet.ts:118](https://github.com/jo3-l/obscenity/blob/37976b6/src/dataset/DataSet.ts#L118)

___

### getPayloadWithPhraseMetadata

▸ **getPayloadWithPhraseMetadata**(`payload`): [`MatchPayloadWithPhraseMetadata`](../README.md#matchpayloadwithphrasemetadata)<`MetadataType`\>

Retrieves the phrase metadata associated with a pattern and returns a
copy of the match payload with said metadata attached to it.

**`Example`**

```typescript
const matches = matcher.getAllMatches(input);
const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
// Now we can access the 'phraseMetadata' property:
const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`MatchPayload`](../interfaces/MatchPayload.md) | Original match payload. |

#### Returns

[`MatchPayloadWithPhraseMetadata`](../README.md#matchpayloadwithphrasemetadata)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:94](https://github.com/jo3-l/obscenity/blob/37976b6/src/dataset/DataSet.ts#L94)

___

### removePhrasesIf

▸ **removePhrasesIf**(`predicate`): [`DataSet`](DataSet.md)<`MetadataType`\>

Removes phrases that match the predicate given.

**`Example`**

```typescript
const customDataset = new DataSet<{ originalWord: string }>()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'fuck');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`phrase`: [`PhraseContainer`](../interfaces/PhraseContainer.md)<`MetadataType`\>) => `boolean` | A predicate that determines whether or not a phrase should be removed. Return `true` to remove, `false` to keep. |

#### Returns

[`DataSet`](DataSet.md)<`MetadataType`\>

#### Defined in

[src/dataset/DataSet.ts:46](https://github.com/jo3-l/obscenity/blob/37976b6/src/dataset/DataSet.ts#L46)
