import type { Interval } from '../../util/Interval';
import { compareIntervals } from '../../util/Interval';
import type { IntervalCollection } from './IntervalCollection';

export class TreeIntervalCollection implements IntervalCollection {
	private rootNode?: IntervalTreeNode;
	private _size = 0;

	public insert(lowerBound: number, upperBound: number) {
		this._size++;
		const node = new IntervalTreeNode(lowerBound, upperBound);
		if (!this.rootNode) {
			this.rootNode = node;
			return;
		}

		let cur = this.rootNode;
		while (cur !== node) {
			if (upperBound > cur.maxSubTreeValue) cur.maxSubTreeValue = upperBound;
			if (compareIntervals(cur.lowerBound, cur.upperBound, lowerBound, upperBound) <= 0) {
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

	public fullyContains(lowerBound: number, upperBound: number) {
		if (!this.rootNode) return false;
		return this.fullyContainsRecursive(this.rootNode, lowerBound, upperBound);
	}

	public values() {
		return this.traverse(this.rootNode);
	}

	public [Symbol.iterator]() {
		return this.values();
	}

	private fullyContainsRecursive(cur: IntervalTreeNode, lowerBound: number, upperBound: number): boolean {
		// If the upper bound is greater than the maximum subtree value of the
		// current node, there won't be any matches.
		if (upperBound > cur.maxSubTreeValue) return false;
		if (cur.lowerBound <= lowerBound && upperBound <= cur.upperBound) return true;
		return (
			(cur.left !== undefined && this.fullyContainsRecursive(cur.left, lowerBound, upperBound)) ||
			(cur.right !== undefined && this.fullyContainsRecursive(cur.right, lowerBound, upperBound))
		);
	}

	private *traverse(cur?: IntervalTreeNode): IterableIterator<Interval> {
		if (!cur) return;
		yield* this.traverse(cur.left);
		yield [cur.lowerBound, cur.upperBound];
		yield* this.traverse(cur.right);
	}
}

class IntervalTreeNode {
	public readonly lowerBound: number;
	public readonly upperBound: number;
	public maxSubTreeValue: number;
	public left?: IntervalTreeNode;
	public right?: IntervalTreeNode;

	public constructor(lowerBound: number, upperBound: number) {
		this.lowerBound = lowerBound;
		this.upperBound = upperBound;
		this.maxSubTreeValue = upperBound;
	}
}
