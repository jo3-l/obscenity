import { convertSurrogatePairToCodePoint, isHighSurrogate, isLowSurrogate } from './Char';

export class CharacterIterator implements IterableIterator<number> {
	private _input: string;

	private lastPosition = -1;

	private currentPosition = 0;

	private _lastWidth = 0;

	public constructor(input?: string) {
		this._input = input ?? '';
	}

	public get input() {
		return this._input;
	}

	public setInput(input: string) {
		this._input = input;
		this.reset();
		return this;
	}

	public reset() {
		this.lastPosition = -1;
		this.currentPosition = 0;
		this._lastWidth = 0;
	}

	public next(): IteratorResult<number, undefined> {
		if (this.done) return { done: true, value: undefined };
		this.lastPosition = this.currentPosition;

		const char = this._input.charCodeAt(this.currentPosition++);
		this._lastWidth = 1;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (this.done || !isHighSurrogate(char)) return { done: false, value: char };

		// Do we have a surrogate pair?
		const next = this._input.charCodeAt(this.currentPosition);
		if (isLowSurrogate(next)) {
			this._lastWidth++;
			this.currentPosition++;
			return { done: false, value: convertSurrogatePairToCodePoint(char, next) };
		}

		return { done: false, value: char };
	}

	// Position of the iterator; equals the start index of the last character consumed.
	// -1 if no characters were consumed yet.
	public get position() {
		return this.lastPosition;
	}

	// Width of the last character consumed; 2 if it was a surrogate pair and 1 otherwise.
	// 0 if no characters were consumed yet.
	public get lastWidth() {
		return this._lastWidth;
	}

	public get done() {
		return this.currentPosition >= this._input.length;
	}

	public [Symbol.iterator]() {
		return this;
	}
}
