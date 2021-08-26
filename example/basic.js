const { RegExpMatcher, englishDataset, englishRecommendedTransformers } = require('../dist');

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const input = 'ʃʃᵤс𝗄 you';
console.log(matcher.hasMatch(input) ? 'The input contains obscenities.' : 'The input does not contain obscenities.');
