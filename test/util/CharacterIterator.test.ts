import { CharacterCode } from '../../src/util/Char';
import { CharacterIterator } from '../../src/util/CharacterIterator';

describe('constructor', () => {
	it('should default the input to an empty string if not provided', () => {
		expect(new CharacterIterator(undefined).input).toBe('');
	});

	it('should set the input to that provided if not undefined', () => {
		expect(new CharacterIterator('hello').input).toBe('hello');
	});

	it('should default the position to -1', () => {
		expect(new CharacterIterator('world').position).toBe(-1);
	});
});

describe('CharacterIterator#setInput()', () => {
	it('should reset the position', () => {
		const iter = new CharacterIterator('world');
		iter.next();
		expect(iter.setInput('hello').position).toBe(-1);
	});

	it('should set the input', () => {
		const iter = new CharacterIterator('world');
		iter.next();
		expect(iter.setInput('hello').input).toBe('hello');
	});
});

describe('CharacterIterator#reset()', () => {
	it('should reset the position', () => {
		const iter = new CharacterIterator('world');
		iter.next();
		iter.reset();
		expect(iter.position).toBe(-1);
		expect(iter.next()).toStrictEqual({ done: false, value: 'w'.charCodeAt(0) });
	});

	it('should not reset the input', () => {
		const iter = new CharacterIterator('hello');
		iter.next();
		iter.reset();
		expect(iter.input).toBe('hello');
	});
});

describe('CharacterIterator#next()', () => {
	it('should return done: true when done', () => {
		const iter = new CharacterIterator();
		expect(iter.next()).toStrictEqual({ done: true, value: undefined });
	});

	it('should return the next character code unmodified if it does not form a surrogate pair', () => {
		const iter = new CharacterIterator('h');
		expect(iter.next()).toStrictEqual({ done: false, value: 'h'.charCodeAt(0) });
	});

	it('should return the next character despite it being a high surrogate if it is the last character', () => {
		const highSurrogate = '🌉'.charCodeAt(0);
		const iter = new CharacterIterator(String.fromCharCode(highSurrogate));
		expect(iter.next()).toStrictEqual({ done: false, value: highSurrogate });
	});

	it('should return the next character despite it being a high surrogate if the character after it is not a low surrogate', () => {
		const highSurrogate = '🌉'.charCodeAt(0);
		const iter = new CharacterIterator(String.fromCharCode(highSurrogate, CharacterCode.LowerA));
		expect(iter.next()).toStrictEqual({ done: false, value: highSurrogate });
		expect(iter.next()).toStrictEqual({ done: false, value: CharacterCode.LowerA });
	});

	it('should combine valid surrogate pairs into its corresponding code point', () => {
		const iter = new CharacterIterator('🌉abc');
		expect(iter.next()).toStrictEqual({ done: false, value: '🌉abc'.codePointAt(0) });
		expect(iter.next()).toStrictEqual({ done: false, value: CharacterCode.LowerA });
	});
});

describe('CharacterIterator#position', () => {
	it('should start as -1', () => {
		expect(new CharacterIterator().position).toBe(-1);
	});

	it('should be the start position of the last character read (no surrogate pairs)', () => {
		const iter = new CharacterIterator('test');
		iter.next();
		expect(iter.position).toBe(0);
	});

	it('should be the start position of the last character read (with surrogate pairs)', () => {
		const iter = new CharacterIterator('🌉abc');
		iter.next();
		expect(iter.position).toBe(0);
		iter.next();
		expect(iter.position).toBe(2); // surrogate pair takes up 2 chars
	});

	it('should revert to -1 after resetting', () => {
		const iter = new CharacterIterator('hello');
		iter.next();
		iter.reset();
		expect(iter.position).toBe(-1);
	});
});

describe('CharacterIterator#lastWidth', () => {
	it('should start as 0', () => {
		expect(new CharacterIterator().lastWidth).toBe(0);
	});

	it('should be 2 if the last character consumed was a surrogate pair', () => {
		const iter = new CharacterIterator('🌉abc');
		iter.next();
		expect(iter.lastWidth).toBe(2);
	});

	it('should be 1 if the last character consumed was not a surrogate pair', () => {
		const iter = new CharacterIterator('hello');
		iter.next();
		expect(iter.lastWidth).toBe(1);
	});

	it('should revert to 0 after resetting', () => {
		const iter = new CharacterIterator('asdf');
		iter.next();
		iter.reset();
		expect(iter.lastWidth).toBe(0);
	});
});

describe('CharacterIterator#done', () => {
	it('should be true for empty strings', () => {
		expect(new CharacterIterator().done).toBeTruthy();
	});

	it('should be false if the input has not been completely consumed', () => {
		expect(new CharacterIterator('hh').done).toBeFalsy();
	});

	it('should be true if all input has been consumed', () => {
		const iter = new CharacterIterator('hello');
		for (let i = 0; i < 5; i++) iter.next();
		expect(iter.done).toBeTruthy();
	});

	it('should be false after resetting', () => {
		const iter = new CharacterIterator('hello');
		for (let i = 0; i < 5; i++) iter.next();
		expect(iter.done).toBeTruthy();
		iter.reset();
		expect(iter.done).toBeFalsy();
	});
});

describe('iterating over it', () => {
	it('should be iterable', () => {
		const iter = new CharacterIterator('hello!');
		const chars: number[] = [];
		for (const char of iter) {
			chars.push(char);
		}

		expect(String.fromCodePoint(...chars)).toBe('hello!');
	});
});
