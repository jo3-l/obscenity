const {
	TextCensor,
	PatternMatcher,
	englishDataset,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedWhitelistMatcherTransformers,
} = require('../dist');

const matcher = new PatternMatcher({
	...englishDataset.build(),
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
});
const censor = new TextCensor();

const input = 'you are a fucking retard';
const matches = matcher.getAllMatches(input);
console.log(censor.applyTo(input, matches));
