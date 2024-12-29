import { getAndAssertSingleCodePoint } from '../util/Char';
import type { CensorContext, TextCensorStrategy } from './TextCensor';

/**
 * A text censoring strategy that extends another strategy, adding the first
 * character matched at the start of the generated string.
 *
 * @example
 * ```typescript
 * const strategy = keepStartCensorStrategy(grawlixCensorStrategy());
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'f$@* you'
 * ```
 * @example
 * ```typescript
 * // Since keepEndCensorStrategy() returns another text censoring strategy, you can use it
 * // as the base strategy to pass to keepStartCensorStrategy().
 * const strategy = keepStartCensorStrategy(keepEndCensorStrategy(asteriskCensorStrategy()));
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'f**k you'
 * ```
 * @param baseStrategy - Strategy to extend. It will be used to produce the end of
 * the generated string.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function keepStartCensorStrategy(baseStrategy: TextCensorStrategy): TextCensorStrategy {
	return (ctx: CensorContext) => {
		if (ctx.overlapsAtStart) return baseStrategy(ctx);
		const firstChar = String.fromCodePoint(ctx.input.codePointAt(ctx.startIndex)!);
		return firstChar + baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 });
	};
}

/**
 * A text censoring strategy that extends another strategy, adding the last
 * character matched at the end of the generated string.
 *
 * @example
 * ```typescript
 * const strategy = keepEndCensorStrategy(asteriskCensorStrategy());
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '***k you'
 * ```
 * @param baseStrategy - Strategy to extend. It will be used to produce the start
 * of the generated string.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function keepEndCensorStrategy(baseStrategy: TextCensorStrategy): TextCensorStrategy {
	return (ctx: CensorContext) => {
		if (ctx.overlapsAtEnd) return baseStrategy(ctx);
		const lastChar = String.fromCodePoint(ctx.input.codePointAt(ctx.endIndex)!);
		return baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 }) + lastChar;
	};
}

/**
 * A text censoring strategy that generates strings made up of asterisks (`*`).
 *
 * @example
 * ```typescript
 * const strategy = asteriskCensorStrategy();
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '**** you'
 * ```
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function asteriskCensorStrategy() {
	return fixedCharCensorStrategy('*');
}

/**
 * A text censoring strategy that generates
 * [grawlix](https://www.merriam-webster.com/words-at-play/grawlix-symbols-swearing-comic-strips),
 * i.e. strings that contain the characters `%`, `@`, `$`, `&`, and `*`.
 *
 * @example
 * ```typescript
 * const strategy = grawlixCensorStrategy();
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '%@&* you'
 * ```
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function grawlixCensorStrategy() {
	return randomCharFromSetCensorStrategy('%@$&*');
}

/**
 * A text censoring strategy that returns a fixed string.
 *
 * @example
 * ```typescript
 * // The replacement phrase '' effectively removes all matched regions
 * // from the string.
 * const strategy = fixedPhraseCensorStrategy('');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: ' you'
 * ```
 * @example
 * ```typescript
 * const strategy = fixedPhraseCensorStrategy('fudge');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'fudge you'
 * ```
 * @param phrase - Replacement phrase to use.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function fixedPhraseCensorStrategy(phrase: string): TextCensorStrategy {
	return () => phrase;
}

/**
 * A text censoring strategy that generates replacement strings that are made up
 * of the character given, repeated as many times as needed.
 *
 * @example
 * ```typescript
 * const strategy = fixedCharCensorStrategy('*');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '**** you'.
 * ```
 * @param char - String that represents the code point which should be used when
 * generating the replacement string. Must be exactly one code point in length.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function fixedCharCensorStrategy(char: string): TextCensorStrategy {
	// Make sure the input character is one code point in length.
	getAndAssertSingleCodePoint(char);
	return (ctx: CensorContext) => char.repeat(ctx.matchLength);
}

/**
 * A text censoring strategy that generates replacement strings made up of
 * random characters from the set of characters provided. The strings never
 * contain two of the same character in a row.
 *
 * @example
 * ```typescript
 * const strategy = randomCharFromSetCensorStrategy('$#!');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you!'
 * // After: '!#$# you!'
 * ```
 * @param charset - Set of characters from which the replacement string should
 * be constructed. Must have at least two characters.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
export function randomCharFromSetCensorStrategy(charset: string): TextCensorStrategy {
	const chars = [...charset];
	if (chars.length < 2) throw new Error('The character set passed must have at least 2 characters.');
	return (ctx: CensorContext) => {
		if (ctx.matchLength === 0) return '';

		let lastIdx = Math.floor(Math.random() * chars.length);
		let censored = chars[lastIdx];
		for (let i = 1; i < ctx.matchLength; i++) {
			let idx = Math.floor(Math.random() * (chars.length - 1));
			// Transform the distribution for idx from [0, len-1) to
			// [0, lastIdx) ∪ (lastIdx, len) to exclude lastIdx while
			// ensuring a uniform distribution of generated characters.
			if (idx >= lastIdx) idx++;
			lastIdx = idx;
			censored += chars[idx];
		}
		return censored;
	};
}
