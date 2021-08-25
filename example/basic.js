const { PatternMatcher, englishDataset, englishRecommendedTransformers } = require('../dist');

// Creating a matcher is somewhat expensive, so do this only once in your app if possible:
const matcher = new PatternMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const input = 'ʃʃᵤс𝗄 you';
console.log(matcher.hasMatch(input) ? 'The input contains obscenities.' : 'The input does not contain obscenities.');
