export function parseNumRuns() {
	if (process.argv.length <= 2) return 1e4;
	const raw = process.argv[2];
	if (!/^\d+[kK]?$/.test(raw)) {
		console.log(`${red('Invalid number of runs passed.')}
Pass nothing to use the default of 10,000 runs, or provide a single argument representing a number.
A higher run count will lower the standard deviation of the result but will take longer to complete.
A reasonable value is between 1,000 and 100,000.

${bold('Example:')} ${italic('node ...')} - runs the benchmark @ 10,000 runs
${bold('Example:')} ${italic('node ... 1k')} - runs the benchmark @ 1,000 runs
`);
		process.exit(1);
	}

	const parsed = parseInt(raw, 10);
	return raw.endsWith('k') || raw.endsWith('K') ? parsed * 1_000 : parsed;
}

export const green = makeColorizer(32);
export const yellow = makeColorizer(33);
export const italic = makeColorizer(3);
export const bold = makeColorizer(1);
export const red = makeColorizer(31);

function makeColorizer(code: number) {
	return (text: string) => `\x1b[${code}m${text}\x1b[0m`;
}
