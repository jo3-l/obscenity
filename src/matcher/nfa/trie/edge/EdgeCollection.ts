export interface EdgeCollection<T> extends Iterable<Edge<T>> {
	set(char: number, node: T): void;
	get(char: number): T | undefined;
	get size(): number;
	keys(): IterableIterator<number>;
	values(): IterableIterator<T>;
}

export type Edge<T> = [char: number, node: T];
