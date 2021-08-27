// Add a new word to the English dataset and removing an existing one.

// Import what we need from Obscenity.
const { RegExpMatcher, DataSet, englishDataset, englishRecommendedTransformers, pattern } = require('../dist');

// Create a new dataset.
const myDataset = new DataSet()
	// Add all the data from the english dataset into our new one.
	.addAll(englishDataset)
	// Remove "fuck" and all its variants.
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'fuck')
	// Add "simp".
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ originalWord: 'simp' })
			.addPattern(pattern`simp`)
			.addWhitelistedTerm('simple'),
	);

// Use our new dataset.
const matcher = new RegExpMatcher({
	...myDataset,
	...englishRecommendedTransformers,
});

console.log(matcher.hasMatch('simp'));
