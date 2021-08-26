// A REPL where you can enter text and see whether Obscenity matches on it with
// its English preset.

// Import the REPL built-in package.
const repl = require('repl');
// Import what we need from Obscenity.
const { RegExpMatcher, englishDataset, englishRecommendedTransformers } = require('../dist');

// Create our matcher, using the English preset.
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

// Display a nice welcome message.
console.log(`Welcome to the REPL example for Obscenity.
Type ".help" for more information.`);

// Start our REPL server.
const replServer = repl.start({
	prompt: '> ',
	eval(input, _ctx, _file, cb) {
		// Get all matches of blacklisted terms in the input. We pass 'true' to
		// getAllMatches() so the output is sorted (easier to read).
		const matches = matcher
			.getAllMatches(input, true)
			// Add some additional metadata about the phrases that were matched.
			.map((match) => englishDataset.getPayloadWithPhraseMetadata(match));

		// Return the matches to the REPL server.
		cb(undefined, matches);
	},
});

// Overwrite the default help command.
replServer.defineCommand('help', {
	help: 'View a help message',
	action() {
		console.log(`To try out Obscenity with the English preset, simply type a phrase.
Obscene words found in the input will be displayed when you click enter.

Press ^D to exit the REPL`);
		this.displayPrompt();
	},
});

// Override some special commands that aren't useful for this example.
function invalidCommand() {
	console.log('Invalid REPL keyword');
	this.displayPrompt();
}

replServer.defineCommand('save', { action: invalidCommand });
replServer.defineCommand('load', { action: invalidCommand });
