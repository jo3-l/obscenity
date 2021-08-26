const repl = require('repl');
const fs = require('fs');
const { join } = require('path');

const words = fs.readFileSync(join(__dirname, 'english-words.txt'), { encoding: 'utf8' }).split('\n');

repl.start({
	prompt: '> ',
	eval: (cmd, _, __, cb) => {
		cmd = cmd.trim();
		let prefixAnchor = cmd.startsWith('^');
		if (prefixAnchor) cmd = cmd.slice(1);

		let suffixAnchor = cmd.endsWith('$');
		if (suffixAnchor) cmd = cmd.slice(0, -1);

		const result = [];
		for (let i = 0; i < words.length; i++) {
			words[i] = words[i].trim();
			const word = words[i];
			let ok = false;
			if (prefixAnchor) ok = word.startsWith(cmd);
			else if (suffixAnchor) ok = word.endsWith(cmd);
			else ok = word.includes(cmd);
			if (ok) result.push(word);
		}

		cb(undefined, result);
	},
	writer: (output) => {
		if (output.length === 0) return 'No words found matching the query given.';
		return `${output.length} words found:\n\n${output.join('\n')}`;
	},
});
