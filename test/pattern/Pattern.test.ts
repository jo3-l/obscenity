import { describe, expect, it } from 'vitest';

import { Parser } from '@/pattern/Parser';
import { parseRawPattern, pattern } from '@/pattern/Pattern';

const parser = new Parser();

describe('pattern template tag', () => {
	it('should parse the pattern given', () => {
		expect(pattern`hello world?`).toStrictEqual(parser.parse('hello world?'));
	});

	it('should not require double-escaping backslashes', () => {
		expect(pattern`hello escaped \[ :D`).toStrictEqual(parser.parse('hello escaped \\[ :D'));
	});

	it('should interpolate one expression appropriately', () => {
		const value = 123;
		expect(pattern`value=${value}`).toStrictEqual(parser.parse('value=123'));
	});

	it('should interpolate many expressions appropriately', () => {
		const value0 = 123;
		const value1 = 234;
		expect(pattern`value0=${value0} value1=${value1} something after :)`).toStrictEqual(
			parser.parse('value0=123 value1=234 something after :)'),
		);
	});

	it('should work with empty strings', () => {
		expect(pattern``).toStrictEqual(parser.parse(''));
	});
});

describe('parseRawPattern()', () => {
	it('should parse the string given', () => {
		expect(parseRawPattern('h[i] ?')).toStrictEqual(parser.parse('h[i] ?'));
	});
});
