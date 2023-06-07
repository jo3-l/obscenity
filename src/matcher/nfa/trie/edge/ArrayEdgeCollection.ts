import type { Edge, EdgeCollection } from './EdgeCollection';

export class ArrayEdgeCollection<T> implements EdgeCollection<T> {
	// Crossover point at which binary search becomes faster than a linear
	// search. Somewhat arbitrary as benchmarking get() is hard (both linear
	// search and binary search execute in less than one-tenth of a millisecond
	// at the scale we're looking at) but micro-benchmarks seem to point to 8-12
	// being a crossover point.
	private static readonly binarySearchThreshold = 10;

	private readonly edges: Edge<T>[] = [];

	private dirty = false;

	public set(char: number, node: T) {
		// Prefer overwriting an existing edge.
		const index = this.edges.findIndex((edge) => edge[0] === char);
		if (index === -1) {
			this.edges.push([char, node]);
			this.dirty = true;
		} else {
			this.edges[index][1] = node;
		}
	}

	public get(char: number) {
		if (this.edges.length <= ArrayEdgeCollection.binarySearchThreshold) {
			for (const edge of this.edges) {
				if (edge[0] === char) return edge[1];
			}

			return;
		}

		if (this.dirty) {
			// Sort by character value.
			this.edges.sort(
				/* istanbul ignore next: not possible to write a robust test for this */
				(a, b) => (a[0] < b[0] ? -1 : b[0] < a[0] ? 1 : 0),
			);
			this.dirty = false;
		}

		let low = 0;
		let high = this.edges.length - 1;
		while (low <= high) {
			const mid = (low + high) >>> 1;
			const edge = this.edges[mid];
			if (edge[0] > char) high = mid - 1;
			else if (edge[0] === char) return edge[1];
			else low = mid + 1;
		}
	}

	public get size() {
		return this.edges.length;
	}

	public keys() {
		return this.edges.map((edge) => edge[0]).values();
	}

	public values() {
		return this.edges.map((edge) => edge[1]).values();
	}

	public [Symbol.iterator]() {
		return this.edges.values();
	}
}
