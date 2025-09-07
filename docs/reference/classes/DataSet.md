[**obscenity**](../README.md)

***

[obscenity](../README.md) / DataSet

# Class: DataSet\<MetadataType\>

Defined in: [src/dataset/DataSet.ts:13](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L13)

Holds phrases (groups of patterns and whitelisted terms), optionally
associating metadata with them.

## Type Parameters

### MetadataType

`MetadataType`

Metadata type for phrases. Note that the metadata
type is implicitly nullable.

## Constructors

### Constructor

> **new DataSet**\<`MetadataType`\>(): `DataSet`\<`MetadataType`\>

#### Returns

`DataSet`\<`MetadataType`\>

## Methods

### addAll()

> **addAll**(`other`): `DataSet`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:29](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L29)

Adds all the phrases from the dataset provided to this one.

#### Parameters

##### other

`DataSet`\<`MetadataType`\>

Other dataset.

#### Returns

`DataSet`\<`MetadataType`\>

#### Example

```typescript
const customDataset = new DataSet().addAll(englishDataset);
```

***

### addPhrase()

> **addPhrase**(`fn`): `DataSet`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:75](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L75)

Adds a phrase to this dataset.

#### Parameters

##### fn

(`builder`) => [`PhraseBuilder`](PhraseBuilder.md)\<`MetadataType`\>

A function that takes a [[PhraseBuilder]], adds
patterns/whitelisted terms/metadata to it, and returns it.

#### Returns

`DataSet`\<`MetadataType`\>

#### Example

```typescript
const data = new DataSet<{ originalWord: string }>()
	.addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fuck' })
		.addPattern(pattern`fuck`)
		.addPattern(pattern`f[?]ck`)
		.addWhitelistedTerm('Afck'))
	.build();
```

***

### build()

> **build**(): `Pick`\<[`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md), `"blacklistedTerms"` \| `"whitelistedTerms"`\>

Defined in: [src/dataset/DataSet.ts:118](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L118)

Returns the dataset in a format suitable for usage with the [[RegExpMatcher]].

#### Returns

`Pick`\<[`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md), `"blacklistedTerms"` \| `"whitelistedTerms"`\>

#### Example

```typescript
// With the RegExpMatcher:
const matcher = new RegExpMatcher({
	...dataset.build(),
	// additional options here
});
```

***

### getPayloadWithPhraseMetadata()

> **getPayloadWithPhraseMetadata**(`payload`): [`MatchPayloadWithPhraseMetadata`](../type-aliases/MatchPayloadWithPhraseMetadata.md)\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:94](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L94)

Retrieves the phrase metadata associated with a pattern and returns a
copy of the match payload with said metadata attached to it.

#### Parameters

##### payload

[`MatchPayload`](../interfaces/MatchPayload.md)

Original match payload.

#### Returns

[`MatchPayloadWithPhraseMetadata`](../type-aliases/MatchPayloadWithPhraseMetadata.md)\<`MetadataType`\>

#### Example

```typescript
const matches = matcher.getAllMatches(input);
const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
// Now we can access the 'phraseMetadata' property:
const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
```

***

### removePhrasesIf()

> **removePhrasesIf**(`predicate`): `DataSet`\<`MetadataType`\>

Defined in: [src/dataset/DataSet.ts:46](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/dataset/DataSet.ts#L46)

Removes phrases that match the predicate given.

#### Parameters

##### predicate

(`phrase`) => `boolean`

A predicate that determines whether or not a phrase should be removed.
Return `true` to remove, `false` to keep.

#### Returns

`DataSet`\<`MetadataType`\>

#### Example

```typescript
const customDataset = new DataSet<{ originalWord: string }>()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'fuck');
```
