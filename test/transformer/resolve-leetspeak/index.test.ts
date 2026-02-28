import { RegExpMatcher, pattern } from '../../../src';
import { resolveLeetSpeakTransformer } from '../../../src/transformer/resolve-leetspeak';
import { TransformerType } from '../../../src/transformer/Transformers';
import { CharacterCode } from '../../../src/util/Char';

describe('resolveLeetSpeakTransformer()', () => {
	it('should return a stateful transformer container', () => {
		const container = resolveLeetSpeakTransformer();
		expect(container.type).toBe(TransformerType.Stateful);
		expect(typeof container.factory).toBe('function');
	});

	describe('character remapping', () => {
		it('should remap relevant characters to their normalized equivalent', () => {
			const transformer = resolveLeetSpeakTransformer().factory();
			expect(transformer.transform('@'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('4'.charCodeAt(0))).toBe(CharacterCode.LowerA);
			expect(transformer.transform('('.charCodeAt(0))).toBe('c'.charCodeAt(0));
			expect(transformer.transform('3'.charCodeAt(0))).toBe('e'.charCodeAt(0));
			expect(transformer.transform('1'.charCodeAt(0))).toBe('i'.charCodeAt(0));
			expect(transformer.transform('|'.charCodeAt(0))).toBe('i'.charCodeAt(0));
			expect(transformer.transform('6'.charCodeAt(0))).toBe('g'.charCodeAt(0));
			expect(transformer.transform('0'.charCodeAt(0))).toBe('o'.charCodeAt(0));
			expect(transformer.transform('$'.charCodeAt(0))).toBe('s'.charCodeAt(0));
			expect(transformer.transform('5'.charCodeAt(0))).toBe('s'.charCodeAt(0));
			expect(transformer.transform('7'.charCodeAt(0))).toBe('t'.charCodeAt(0));
			expect(transformer.transform('2'.charCodeAt(0))).toBe(CharacterCode.LowerZ);
		});

		it('should leave other characters as is', () => {
			const transformer = resolveLeetSpeakTransformer().factory();
			expect(transformer.transform('f'.charCodeAt(0))).toBe('f'.charCodeAt(0));
			expect(transformer.transform(CharacterCode.Backslash)).toBe(CharacterCode.Backslash);
		});

		it('should only remap ! to i when it appears mid-word', () => {
			const transformer = resolveLeetSpeakTransformer().factory();

			// Preceded by nothing: leave as-is
			expect(transformer.transform('!'.charCodeAt(0))).toBe('!'.charCodeAt(0));

			transformer.reset();

			// Preceded by space (non-alphabetic): leave as-is
			transformer.transform(' '.charCodeAt(0));
			expect(transformer.transform('!'.charCodeAt(0))).toBe('!'.charCodeAt(0));

			transformer.reset();

			// Preceded by 'd': remap to 'i'
			transformer.transform('d'.charCodeAt(0));
			expect(transformer.transform('!'.charCodeAt(0))).toBe('i'.charCodeAt(0));

			// Preceded by 'i': remap to 'i'
			expect(transformer.transform('!'.charCodeAt(0))).toBe('i'.charCodeAt(0));
		});
	});
});

describe('resolveLeetSpeakTransformer() - word boundary regression (#126)', () => {
	it('should match a word followed by ! when a trailing word boundary is required', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`|fuck|` }],
			blacklistMatcherTransformers: [resolveLeetSpeakTransformer()],
		});
		expect(matcher.hasMatch('fuck')).toBe(true);
		expect(matcher.hasMatch('fuck!')).toBe(true);
		expect(matcher.hasMatch('fuck.')).toBe(true);
		expect(matcher.hasMatch('fuck,')).toBe(true);
		expect(matcher.hasMatch('fuckery')).toBe(false);
	});

	it('should match a word containing ! as an i', () => {
		const matcher = new RegExpMatcher({
			blacklistedTerms: [{ id: 1, pattern: pattern`|dick|` }],
			blacklistMatcherTransformers: [resolveLeetSpeakTransformer()],
		});
		expect(matcher.hasMatch('d!ck')).toBe(true);
		expect(matcher.hasMatch('d!ck!')).toBe(true);
	});

	it('should still remap | to i for leet-speak matching', () => {
		const transformer = resolveLeetSpeakTransformer().factory();
		expect(transformer.transform('|'.charCodeAt(0))).toBe('i'.charCodeAt(0));
	});
});
