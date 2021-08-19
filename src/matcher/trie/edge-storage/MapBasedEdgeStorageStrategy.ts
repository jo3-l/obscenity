import type { EdgeStorageStrategy } from './EdgeStorageStrategy';

// Dead simple map storage strategy.
export class MapBasedEdgeStorageStrategy<T> implements EdgeStorageStrategy<T> {
	private readonly edges = new Map<number, T>();

	public set(char: number, node: T) {
		this.edges.set(char, node);
	}

	public get(char: number) {
		return this.edges.get(char);
	}

	public clear() {
		return this.edges.clear();
	}

	public get size() {
		return this.edges.size;
	}

	public chars() {
		return this.edges.keys();
	}

	public nodes() {
		return this.edges.values();
	}

	public [Symbol.iterator]() {
		return this.edges.entries();
	}
}
