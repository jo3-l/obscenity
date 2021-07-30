import { compareIntervals, Interval } from '../Interval';
import { IntervalStorageStrategy } from './IntervalStorageStrategy';

// Tree storage strategy using an augmented interval tree.
export class TreeBasedIntervalStorageStrategy implements IntervalStorageStrategy {
	private root?: IntervalTreeNode;
	private _size = 0;

	public insert(interval: Interval) {
		const node = new IntervalTreeNode(interval);
		this._size++;
		if (!this.root) {
			this.root = node;
			return;
		}

		let cur = this.root;
		while (cur !== node) {
			if (node.interval[1] > cur.maxSubtreeValue) cur.maxSubtreeValue = node.interval[1];
			if (compareIntervals(cur.interval, node.interval) <= 0) cur = cur.right ??= node;
			else cur = cur.left ??= node;
		}
	}

	public get size() {
		return this._size;
	}

	public fullyContains(interval: Interval) {
		if (!this.root) return false;
		return this.fullyContainsRecursive(this.root, interval);
	}

	private fullyContainsRecursive(cur: IntervalTreeNode, interval: Interval): boolean {
		if (cur.interval[0] <= interval[0] && cur.interval[1] >= interval[1]) return true;
		// only search left subtree if its maximum value is greater than the interval's left endpoint
		const inLeft =
			cur.left !== undefined &&
			cur.left.maxSubtreeValue >= interval[0] &&
			this.fullyContainsRecursive(cur.left, interval);
		return inLeft || (cur.right !== undefined && this.fullyContainsRecursive(cur.right, interval));
	}

	public values() {
		if (!this.root) return emptyIterator;
		return this.traverse(this.root);
	}

	private *traverse(node: IntervalTreeNode): IterableIterator<Interval> {
		if (node.left) yield* this.traverse(node.left);
		yield node.interval;
		if (node.right) yield* this.traverse(node.right);
	}

	public [Symbol.iterator]() {
		return this.values();
	}
}

const emptyIterator: IterableIterator<Interval> = {
	next() {
		return { done: true, value: undefined };
	},
	[Symbol.iterator]() {
		return this;
	},
};

class IntervalTreeNode {
	public readonly interval: Interval;
	public maxSubtreeValue: number;
	public left?: IntervalTreeNode;
	public right?: IntervalTreeNode;

	public constructor(interval: Interval) {
		this.interval = interval;
		this.maxSubtreeValue = interval[1];
	}
}
