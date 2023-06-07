export type EdgeCollection<T> = Iterable<Edge<T>> & {
	get(char: number): T | undefined;
	keys(): IterableIterator<number>;
	set(char: number, node: T): void;
	get size(): number;
	values(): IterableIterator<T>;
};

export type Edge<T> = [char: number, node: T];
