# Datasets

> Learn about datasets, a way to organize blacklisted and whitelisted terms.

Say that you want to know what the original word associated with a match was. You could do this with a giant chain of `if-else`s:

```typescript
const patterns = [
	{ id: 0, pattern: pattern`fck` },
	{ id: 1, pattern: pattern`fuck` },
	{ id: 2, pattern: pattern`bish` },
	{ id: 3, pattern: pattern`bitch` },
	// ...
];

const matcher = new RegExpMatcher({ ... });
const payloads = matcher.getAllMatches(text);
for (const payload of payloads) {
	if (payload.termId === 0 || payload.termId === 1) console.log('Original word: fuck');
	else if (payload.termId === 2 || payload.termId === 3) console.log('Original word: bitch');
	// ...
}
```

...but clearly this becomes quite unmaintainable with many patterns. What's the solution?

**Datasets** can come in handy here. They support creating groups of blacklisted/whitelisted terms ("phrases") and associating arbitrary metadata with them. To see what's meant by this, see the following example:

```typescript
import { DataSet, pattern } from 'obscenity';

const dataset = new DataSet<{ originalWord: string }>()
	// addPhrase() adds a new phrase to the dataset.
	.addPhrase((phrase) =>
		phrase
			// setMetadata() sets the metadata of the phrase.
			.setMetadata({ originalWord: 'fuck' })
			// addPattern() associates a pattern with the phrase.
			.addPattern(pattern`fck`)
			.addPattern(pattern`fuck`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ originalWord: 'bitch' })
			.addPattern(pattern`bish`)
			.addPattern(pattern`bitch`)
			// addWhitelistedTerm() associates a whitelisted term with the phrase.
			.addWhitelistedTerm('abish'),
	);
```

To use our dataset with a matcher, we can call the `build()` method, which will produce an object structured like `{ blacklistedTerms, whitelistedTerms }`, which we can then use in the matcher options:

```typescript
const built = dataset.build();
const matcher = new RegExpMatcher({
	blacklistedTerms: built.blacklistedTerms,
	whitelistedTerms: built.whitelistedTerms,
	// Other options go here.
});

// Or, using spread notation:
const matcher = new RegExpMatcher({
	...built,
	// Other options go here.
});
```

But how does this help us solve the original problem (getting the original word from a match)? Simple. We can use the `getPayloadWithPhraseMetadata` method:

```typescript
const payloads = matcher.getAllMatches(input);
const payloadsWithMetadata = payloads.map(dataset.getPayloadWithPhraseMetadata);
```

The `getPayloadWithPhraseMetadata` will return a copy of the original match payload with a new property added: `phraseMetadata`, which is the phrase metadata associated with the term that matched.

So, to get the original word that matched for the first payload, we could just use the following:

```typescript
const originalWord = payloadsWithMetadata[0].phraseMetadata!.originalWord;
```

Though associating metadata with phrases is one of the main features of the `DataSet`, it's by no means the only one, as we'll see in the next section.

## Extending existing datasets

Say that you would like to use the English preset, but you don't really agree with one of the words in there. That's simple to fix: we can just extend the dataset of English words:

```typescript
const myDataset = new DataSet<{ originalWord: string }>()
	// addAll() adds all the data from the dataset passed.
	.addAll(englishDataset)
	// removePhrasesIf() removes phrases from the current dataset if the function provided
	// returns true.
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'bitch');
```

The `addAll` method adds

Using our new dataset is equally as simple:

```typescript
const matcher = new RegExpMatcher({
	...myDataset.build(),
	// Other options go here.
});
```

---

**Next up: [Censoring text](./censoring-text.md).**
