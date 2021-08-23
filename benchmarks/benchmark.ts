import type { RecordableHistogram } from 'perf_hooks';
import { createHistogram, performance } from 'perf_hooks';

import { bold, green, italic, yellow } from './util';

export class BenchmarkSuite {
	private readonly tests: Test[] = [];

	public constructor(private readonly title: string) {}

	public add(title: string, fn: () => void) {
		const histogram = createHistogram();
		const wrapped = performance.timerify(fn, { histogram });
		this.tests.push({ title, fn: wrapped, histogram });
		return this;
	}

	public run(numRuns: number) {
		console.log(`🏁 Start benchmark ${green(this.title)}\n`);
		for (const test of this.tests) {
			for (let n = 0; n < numRuns; n++) test.fn();
		}

		for (let i = 0; i < this.tests.length; i++) {
			if (i > 0) console.log();
			this.display(this.tests[i].title, this.tests[i].histogram);
		}
	}

	private display(title: string, h: RecordableHistogram) {
		console.log(`Results for ${italic(title)}:`);
		console.log(`  - ${bold('Min:')} ${yellow((h.min / 1e6).toFixed(2))} ms`);
		console.log(`  - ${bold('Max:')} ${yellow((h.max / 1e6).toFixed(2))} ms`);
		console.log(`  - ${bold('Mean:')} ${yellow((h.mean / 1e6).toFixed(2))} ms`);
		console.log(`  - ${bold('Standard deviation:')} ${yellow((h.stddev / 1e6).toFixed(2))} ms`);
	}
}

interface Test {
	title: string;
	fn: () => void;
	histogram: RecordableHistogram;
}
