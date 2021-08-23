import { ArrayIntervalCollection } from './ArrayIntervalCollection';
import type { IntervalCollection } from './IntervalCollection';
import { TreeIntervalCollection } from './TreeIntervalCollection';

export class DynamicIntervalCollection implements IntervalCollection {
	private _underlyingImplementation: IntervalCollection = new ArrayIntervalCollection();
	private implementation = IntervalCollectionImplementation.Array;

	public insert(lowerBound: number, upperBound: number) {
		this._underlyingImplementation.insert(lowerBound, upperBound);
		const optimalImplementation = this.selectOptimalImplementation();
		if (this.implementation !== optimalImplementation) {
			const newStorage = this.instantiateImplementation(optimalImplementation);
			for (const [lowerBound, upperBound] of this._underlyingImplementation) newStorage.insert(lowerBound, upperBound);
			this._underlyingImplementation = newStorage;
			this.implementation = optimalImplementation;
		}
	}

	public fullyContains(lowerBound: number, upperBound: number) {
		return this._underlyingImplementation.fullyContains(lowerBound, upperBound);
	}

	public get size() {
		return this._underlyingImplementation.size;
	}

	public get underlyingImplementation() {
		return this._underlyingImplementation;
	}

	public values() {
		return this._underlyingImplementation.values();
	}

	public [Symbol.iterator]() {
		return this._underlyingImplementation.values();
	}

	private selectOptimalImplementation() {
		return this.size < 10 ? IntervalCollectionImplementation.Array : IntervalCollectionImplementation.Tree;
	}

	private instantiateImplementation(implementation: IntervalCollectionImplementation) {
		return implementation === IntervalCollectionImplementation.Array
			? /* istanbul ignore next: instantiateImplementation() should never be called with IntervalCollectionImplementation.Array */
			  new ArrayIntervalCollection()
			: new TreeIntervalCollection();
	}
}

const enum IntervalCollectionImplementation {
	Array,
	Tree,
}
