export interface EdgeStorageStrategy<T> extends Iterable<Edge<T>> {
	set(char: number, node: T): void;
	get(char: number): T | undefined;
	clear(): void;
	get size(): number;
	chars(): IterableIterator<number>;
	nodes(): IterableIterator<T>;
}

export type Edge<T> = [char: number, node: T];
