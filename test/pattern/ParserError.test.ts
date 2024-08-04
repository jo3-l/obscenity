import { describe, expect, it } from 'vitest';

import { ParserError } from '@/pattern/ParserError';

describe('ParserError#name', () => {
	it("should be equal to 'ParserError'", () => {
		const err = new ParserError('', 0, 0);
		expect(err.name).toBe('ParserError');
	});
});

describe('ParserError#line', () => {
	it('should be equal to the value passed to the constructor', () => {
		const err = new ParserError('', 1, 0);
		expect(err.line).toBe(1);
	});
});

describe('ParserError#column', () => {
	it('should be equal to the value passed to the constructor', () => {
		const err = new ParserError('', 0, 500);
		expect(err.column).toBe(500);
	});
});

describe('ParserError#message', () => {
	it("should be in the format 'line:column: message'", () => {
		const err = new ParserError('hi', 1, 10);
		expect(err.message).toBe('1:10: hi');
	});
});
