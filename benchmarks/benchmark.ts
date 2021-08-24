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

	public run(numRuns: number): BenchmarkResult {
		console.log(`🏁 Start benchmark ${green(this.title)}\n`);
		let fastest = 0;
		for (let i = 0; i < this.tests.length; i++) {
			const test = this.tests[i];
			for (let n = 0; n < numRuns; n++) test.fn();
			if (test.histogram.mean < this.tests[fastest].histogram.mean) fastest = i;
		}

		console.log(`  ${bold('Fastest:')} ${italic(this.tests[fastest].title)}`);
		for (const test of this.tests) {
			console.log();
			this.display(test.title, test.histogram, this.tests[fastest].histogram);
		}

		return {
			fastest: this.toTestResult(this.tests[fastest]),
			individualResults: this.tests.map(this.toTestResult),
		};
	}

	private display(title: string, h: RecordableHistogram, fastest: RecordableHistogram) {
		console.log(`  Results for ${italic(title)}:`);
		console.log(`    - ${bold('Min:')} ${yellow((h.min / 1e6).toFixed(2))} ms`);
		console.log(`    - ${bold('Max:')} ${yellow((h.max / 1e6).toFixed(2))} ms`);
		console.log(`    - ${bold('Mean:')} ${yellow((h.mean / 1e6).toFixed(2))} ms`);
		console.log(`    - ${bold('Standard deviation:')} ${yellow((h.stddev / 1e6).toFixed(2))} ms`);
		console.log(`    - ${bold('Relative performance:')} ${yellow(((fastest.mean / h.mean) * 100).toFixed(2))}%`);
	}

	private toTestResult(test: Test) {
		return { title: test.title, histogram: test.histogram };
	}
}

export interface BenchmarkResult {
	fastest: TestResult;
	individualResults: TestResult[];
}

export interface TestResult {
	title: string;
	histogram: RecordableHistogram;
}

interface Test {
	title: string;
	fn: () => void;
	histogram: RecordableHistogram;
}
