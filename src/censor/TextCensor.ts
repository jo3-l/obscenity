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
	 * Sets the censoring strategy, which will generate replacement text for
	 * regions of the text that should be censored.
	 *
	 * The default censoring strategy is the [[grawlixCensorStrategy]],
	 * generating text like `$%@*` but there are also several other built-in
	 * strategies available:
	 * - [[keepStartCensorStrategy]] - wraps another strategy and keeps the
	 *   first character matched, e.g. `f***`.
	 * - [[keepEndCensorStrategy]] - keeps the last character matched, e.g.
	 *   `***k`.
	 * - [[asteriskCensorStrategy]] - replaces the text with asterisks, e.g.
	 *   `****`.
	 * - [[grawlixCensorStrategy]] - the default strategy, discussed earlier.
	 *
	 * Note that censoring strategies are simple functions (see the documentation
	 * for [[TextCensorStrategy]]), so it is relatively simple to create your own.
	 *
	 * In addition, there are a number of utilities that ease creation of
	 * common censoring strategies:
	 * - [[fixedPhraseCensorStrategy]] - returns a fixed phrase, e.g. `fudge`.
	 * - [[fixedCharCensorStrategy]] - returns a fixed character repeated an
	 *   appropriate number of times.
	 * - [[randomCharFromSetCensorStrategy]] - returns an appropriate number of
	 *   characters chosen at random from the set given.
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
	 * text. There is no single "best way" to handle them, but the
	 * implementation of this method guarantees that overlapping regions will
	 * always be replaced, following the rules detailed below:
	 *
	 * - Replacement text for matched regions will be generated in the order
	 *   specified by [[compareMatchByPositionAndId]];
	 * - When generating replacements for regions that overlap at the start with
	 *   some other region, the start index of the censor context passed to the
	 *   censoring strategy will be the end index of the first region plus one.
	 *
	 * @param input - Input text.
	 * @param matches - A list of matches.
	 * @returns The censored text.
	 */
	public applyTo(input: string, matches: MatchPayload[]) {
		if (matches.length === 0) return input;
		const sorted = [...matches].sort(compareMatchByPositionAndId);

		let censored = '';
		let lastIndex = 0;
		for (let i = 0; i < sorted.length; i++) {
			const match = sorted[i];
			if (lastIndex > match.endIndex) continue; // completely contained in the previous span

			const overlapsAtStart = match.startIndex < lastIndex;
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
 * A text censoring strategy, which receives a [[CensorContext | context]] and
 * returns a replacement string.
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
