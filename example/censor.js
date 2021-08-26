const { TextCensor, RegExpMatcher, englishDataset, englishRecommendedTransformers } = require('../dist');

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
const censor = new TextCensor();

const input = 'you are a fucking retard';
const matches = matcher.getAllMatches(input);
console.log(censor.applyTo(input, matches));
