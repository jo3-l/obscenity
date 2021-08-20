import type { MatchPayload } from '../matcher/MatchPayload';
import { compareMatchByPositionAndId } from '../matcher/MatchPayload';
import { grawlixCensorStrategy } from './BuiltinStrategies';

/**
 * Censors regions of text matched by the [[PatternMatcher]], supporting
 * flexible [[TextCensorStrategy | censoring strategies]].
 */
export class TextCensor {
	private strategy: TextCensorStrategy = grawlixCensorStrategy();

	/**
	 * Sets the censoring strategy, which is responsible for generating
	 * replacement text for regions of the text that should be censored.
	 *
	 * The default censoring strategy is the [[grawlixCensorStrategy]],
	 * generating text like `$%@*`. There are several other built-in strategies
	 * available:
	 * - [[keepStartCensorStrategy]] - extends another strategy and keeps the
	 *   first character matched, e.g. `f***`.
	 * - [[keepEndCensorStrategy]] - extends another strategy and keeps the last
	 *   character matched, e.g. `***k`.
	 * - [[asteriskCensorStrategy]] - replaces the text with asterisks, e.g.
	 *   `****`.
	 * - [[grawlixCensorStrategy]] - the default strategy, discussed earlier.
	 *
	 * Note that since censoring strategies are just functions (see the
	 * documentation for [[TextCensorStrategy]]), it is relatively simple to
	 * create your own.
	 *
	 * To ease creation of common censoring strategies, we provide a number of
	 * utility functions:
	 * - [[fixedPhraseCensorStrategy]] - generates a fixed phrase, e.g. `fudge`.
	 * - [[fixedCharCensorStrategy]] - generates replacement strings constructed
	 *   from the character given, repeated as many times as needed.
	 * - [[randomCharFromSetCensorStrategy]] - generates replacement strings
	 *   made up of random characters from the set of characters provided.
	 *
	 * @param strategy - Text censoring strategy to use.
	 */
	public setStrategy(strategy: TextCensorStrategy) {
		this.strategy = strategy;
		return this;
	}

	/**
	 * Applies the censoring strategy to the text, returning the censored text.
	 *
	 * **Overlapping regions**
	 *
	 * Overlapping regions are an annoying edge case to deal with when censoring
	 * text. There is no single best way to handle them, but the implementation
	 * of this method guarantees that overlapping regions will always be
	 * replaced, following the rules below:
	 *
	 * - Replacement text for matched regions will be generated in the order
	 *   specified by [[compareMatchByPositionAndId]];
	 * - When generating replacements for regions that overlap at the start with
	 *   some other region, the start index of the censor context passed to the
	 *   censoring strategy will be the end index of the first region, plus one.
	 *
	 * @param input - Input text.
	 * @param matches - A list of matches.
	 * @returns The censored text.
	 */
	public applyTo(input: string, matches: MatchPayload[]) {
		if (matches.length === 0) return input;
		const sorted = [...matches].sort(compareMatchByPositionAndId);

		let censored = '';
		let lastIndex = 0; // end index of last match, plus one
		for (let i = 0; i < sorted.length; i++) {
			const match = sorted[i];
			if (lastIndex > match.endIndex) continue; // completely contained in the previous span

			const overlapsAtStart = match.startIndex < lastIndex;
			// Add the chunk of text between the end of the last match and the
			// start of the current match.
			if (!overlapsAtStart) censored += input.slice(lastIndex, match.startIndex);

			const actualStartIndex = Math.max(lastIndex, match.startIndex);
			const overlapsAtEnd =
				i < sorted.length - 1 && // not the last match
				match.endIndex >= sorted[i + 1].startIndex && // end index of this match and start index of next one overlap
				match.endIndex < sorted[i + 1].endIndex; // doesn't completely contain next match
			censored += this.strategy({ ...match, startIndex: actualStartIndex, input, overlapsAtStart, overlapsAtEnd });
			lastIndex = match.endIndex + 1;
		}

		censored += input.slice(lastIndex);
		return censored;
	}
}

/**
 * A text censoring strategy, which receives a [[CensorContext]] and returns a
 * replacement string.
 */
export type TextCensorStrategy = (ctx: CensorContext) => string;

/**
 * Context passed to [[TextCensorStrategy | text censoring strategies]].
 */
export interface CensorContext extends MatchPayload {
	/**
	 * The entire input text, without any censoring applied to it.
	 */
	input: string;

	/**
	 * Whether the current region overlaps at the start with some other region.
	 */
	overlapsAtStart: boolean;

	/**
	 * Whether the current region overlaps at the end with some other region.
	 */
	overlapsAtEnd: boolean;
}
