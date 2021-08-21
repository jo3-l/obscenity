import type { Interval } from '../Interval';
import { compareIntervals } from '../Interval';
import type { IntervalStorageStrategy } from './IntervalStorageStrategy';

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
			if (compareIntervals(cur.interval, node.interval) <= 0) {
				cur.right ??= node;
				cur = cur.right;
			} else {
				cur.left ??= node;
				cur = cur.left;
			}
		}
	}

	public get size() {
		return this._size;
	}

	public fullyContains(interval: Interval) {
		if (!this.root) return false;
		return this.fullyContainsRecursive(this.root, interval);
	}

	public values() {
		return this.traverse(this.root);
	}

	public [Symbol.iterator]() {
		return this.values();
	}

	private fullyContainsRecursive(cur: IntervalTreeNode, interval: Interval): boolean {
		// If the upper bound of the interval is greater than the maximum
		// subtree value, there won't be any matches.
		if (interval[1] > cur.maxSubtreeValue) return false;
		if (cur.interval[0] <= interval[0] && cur.interval[1] >= interval[1]) return true;
		// Only search the left subtree if its maximum value is greater than the interval's left endpoint.
		const inLeft =
			cur.left !== undefined &&
			cur.left.maxSubtreeValue >= interval[0] &&
			this.fullyContainsRecursive(cur.left, interval);
		return inLeft || (cur.right !== undefined && this.fullyContainsRecursive(cur.right, interval));
	}

	private *traverse(node?: IntervalTreeNode): IterableIterator<Interval> {
		if (!node) return;
		yield* this.traverse(node.left);
		yield node.interval;
		yield* this.traverse(node.right);
	}
}

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
