const {
	PatternMatcher,
	englishDataset,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedWhitelistMatcherTransformers,
} = require('../dist');

// Creating a matcher is somewhat expensive, so do this only once in your app if possible:
const matcher = new PatternMatcher({
	...englishDataset.build(),
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
});

const input = 'ʃʃᵤс𝗄 you';
console.log(matcher.hasMatch(input) ? 'The input contains obscenities.' : 'The input does not contain obscenities.');
