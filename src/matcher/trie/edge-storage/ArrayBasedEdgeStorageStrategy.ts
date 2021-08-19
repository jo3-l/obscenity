import type { Edge, EdgeStorageStrategy } from './EdgeStorageStrategy';

// Array-based storage strategy. Uses linear search for small numbers of
// elements and dynamically switches to binary search for larger numbers.
export class ArrayBasedEdgeStorageStrategy<T> implements EdgeStorageStrategy<T> {
	// TODO: Compute a more precise value for this.
	private static readonly maxLinearSearchEdgeCount = 3;

	private readonly edges: Edge<T>[] = [];
	private dirty = false;

	public set(char: number, node: T) {
		// See if we can overwrite the node of an existing edge.
		for (const edge of this.edges) {
			if (edge[0] === char) {
				edge[1] = node;
				return;
			}
		}

		this.dirty = true;
		this.edges.push([char, node]);
	}

	public get(char: number) {
		if (this.edges.length <= ArrayBasedEdgeStorageStrategy.maxLinearSearchEdgeCount) {
			return this.edges.find((edge) => edge[0] === char)?.[1];
		}

		this.ensureBinarySearchInvariants();
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

	public clear() {
		this.edges.splice(0);
	}

	public get size() {
		return this.edges.length;
	}

	public chars() {
		return this.edges.map((edge) => edge[0]).values();
	}

	public nodes() {
		return this.edges.map((edge) => edge[1]).values();
	}

	public [Symbol.iterator]() {
		return this.edges.values();
	}

	private ensureBinarySearchInvariants() {
		if (this.dirty) {
			this.edges.sort((a, b) => a[0] - b[0]);
			this.dirty = false;
		}
	}
}
