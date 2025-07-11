import { compilePatternToRegExp, potentiallyMatchesEmptyString } from '../../pattern/Util';
import { TransformerSet } from '../../transformer/TransformerSet';
import type { TransformerContainer } from '../../transformer/Transformers';
import { isHighSurrogate, isLowSurrogate } from '../../util/Char';
import { CharacterIterator } from '../../util/CharacterIterator';
import type { BlacklistedTerm } from '../BlacklistedTerm';
import { IntervalCollection } from '../IntervalCollection';
import type { Matcher } from '../Matcher';
import type { MatchPayload } from '../MatchPayload';
import { compareMatchByPositionAndId } from '../MatchPayload';

/**
 * An implementation of the [[Matcher]] interface using regular expressions and
 * string searching methods.
 */
export class RegExpMatcher implements Matcher {
	private readonly blacklistedTerms: CompiledBlacklistedTerm[];

	private readonly whitelistedTerms: string[];

	private readonly blacklistMatcherTransformers: TransformerSet;

	private readonly whitelistMatcherTransformers: TransformerSet;

	/**
	 * Creates a new [[RegExpMatcher]] with the options given.
	 *
	 * @example
	 * ```typescript
	 * // Use the options provided by the English preset.
	 * const matcher = new RegExpMatcher({
	 * 	...englishDataset.build(),
	 * 	...englishRecommendedTransformers,
	 * });
	 * ```
	 * @example
	 * ```typescript
	 * // Simple matcher that only has blacklisted patterns.
	 * const matcher = new RegExpMatcher({
	 *  blacklistedTerms: assignIncrementingIds([
	 *      pattern`fuck`,
	 *      pattern`f?uck`, // wildcards (?)
	 *      pattern`bitch`,
	 *      pattern`b[i]tch` // optionals ([i] matches either "i" or "")
	 *  ]),
	 * });
	 *
	 * // Check whether some string matches any of the patterns.
	 * const doesMatch = matcher.hasMatch('fuck you bitch');
	 * ```
	 * @example
	 * ```typescript
	 * // A more advanced example, with transformers and whitelisted terms.
	 * const matcher = new RegExpMatcher({
	 *  blacklistedTerms: [
	 *      { id: 1, pattern: pattern`penis` },
	 *      { id: 2, pattern: pattern`fuck` },
	 *  ],
	 *  whitelistedTerms: ['pen is'],
	 *  blacklistMatcherTransformers: [
	 *      resolveConfusablesTransformer(), // '🅰' => 'a'
	 *      resolveLeetSpeakTransformer(), // '$' => 's'
	 *      foldAsciiCharCaseTransformer(), // case insensitive matching
	 *      skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
	 *      collapseDuplicatesTransformer(), // 'aaaa' => 'a'
	 *  ],
	 * });
	 *
	 * // Output all matches.
	 * console.log(matcher.getAllMatches('fu.....uuuuCK the pen is mightier than the sword!'));
	 * ```
	 * @param options - Options to use.
	 */
	public constructor({
		blacklistedTerms,
		whitelistedTerms = [],
		blacklistMatcherTransformers = [],
		whitelistMatcherTransformers = [],
	}: RegExpMatcherOptions) {
		this.blacklistedTerms = this.compileTerms(blacklistedTerms);
		this.validateWhitelistedTerms(whitelistedTerms);
		this.whitelistedTerms = whitelistedTerms;
		this.blacklistMatcherTransformers = new TransformerSet(blacklistMatcherTransformers);
		this.whitelistMatcherTransformers = new TransformerSet(whitelistMatcherTransformers);
	}

	public getAllMatches(input: string, sorted = false) {
		const whitelistedIntervals = this.getWhitelistedIntervals(input);
		const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.blacklistMatcherTransformers);

		const matches: MatchPayload[] = [];
		for (const blacklistedTerm of this.blacklistedTerms) {
			for (const match of transformed.matchAll(blacklistedTerm.regExp)) {
				const origStartIndex = transformedToOrigIndex[match.index];
				let origEndIndex = transformedToOrigIndex[match.index + match[0].length - 1];
				// End index is (unfortunately) inclusive, so adjust as necessary.
				if (
					origEndIndex < input.length - 1 && // not the last character
					isHighSurrogate(input.charCodeAt(origEndIndex)) && // character is a high surrogate
					isLowSurrogate(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
				) {
					origEndIndex++;
				}

				if (!whitelistedIntervals.query(origStartIndex, origEndIndex)) {
					matches.push({
						termId: blacklistedTerm.id,
						startIndex: origStartIndex,
						endIndex: origEndIndex,
						matchLength: [...match[0]].length,
					});
				}
			}
		}

		if (sorted) matches.sort(compareMatchByPositionAndId);
		return matches;
	}

	public hasMatch(input: string) {
		const whitelistedIntervals = this.getWhitelistedIntervals(input);
		const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.blacklistMatcherTransformers);
		for (const blacklistedTerm of this.blacklistedTerms) {
			for (const match of transformed.matchAll(blacklistedTerm.regExp)) {
				const origStartIndex = transformedToOrigIndex[match.index];
				let origEndIndex = transformedToOrigIndex[match.index + match[0].length - 1];
				// End index is (unfortunately) inclusive, so adjust as necessary.
				if (
					origEndIndex < input.length - 1 && // not the last character
					isHighSurrogate(input.charCodeAt(origEndIndex)) && // character is a high surrogate
					isLowSurrogate(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
				) {
					origEndIndex++;
				}

				if (!whitelistedIntervals.query(origStartIndex, origEndIndex)) return true;
			}
		}

		return false;
	}

	private getWhitelistedIntervals(input: string) {
		const matches = new IntervalCollection();
		const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.whitelistMatcherTransformers);
		for (const whitelistedTerm of this.whitelistedTerms) {
			let lastEnd = 0;
			for (
				let startIndex = transformed.indexOf(whitelistedTerm, lastEnd);
				startIndex !== -1;
				startIndex = transformed.indexOf(whitelistedTerm, lastEnd)
			) {
				let origEndIndex = transformedToOrigIndex[startIndex + whitelistedTerm.length - 1];
				// End index is (unfortunately) inclusive, so adjust as necessary.
				if (
					origEndIndex < input.length - 1 && // not the last character
					isHighSurrogate(input.charCodeAt(origEndIndex)) && // character is a high surrogate
					isLowSurrogate(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
				) {
					origEndIndex++;
				}

				matches.insert(transformedToOrigIndex[startIndex], origEndIndex);
				lastEnd = startIndex + whitelistedTerm.length;
			}
		}

		return matches;
	}

	private applyTransformers(
		input: string,
		transformers: TransformerSet,
	): [transformedToOrigIndex: number[], transformed: string] {
		const transformedToOrigIndex: number[] = [];
		let transformed = '';
		const iter = new CharacterIterator(input);
		for (const char of iter) {
			const transformedChar = transformers.applyTo(char);
			if (transformedChar !== undefined) {
				transformed += String.fromCodePoint(transformedChar);
				while (transformedToOrigIndex.length < transformed.length) transformedToOrigIndex.push(iter.position);
			}
		}

		transformers.resetAll();
		return [transformedToOrigIndex, transformed];
	}

	private compileTerms(terms: BlacklistedTerm[]) {
		const compiled: CompiledBlacklistedTerm[] = [];
		const seenIds = new Set<number>();
		for (const term of terms) {
			if (seenIds.has(term.id)) throw new Error(`Duplicate blacklisted term ID ${term.id}.`);
			if (potentiallyMatchesEmptyString(term.pattern)) {
				throw new Error(`Pattern with ID ${term.id} potentially matches empty string; this is unsupported.`);
			}

			compiled.push({
				id: term.id,
				regExp: compilePatternToRegExp(term.pattern),
			});
			seenIds.add(term.id);
		}

		return compiled;
	}

	private validateWhitelistedTerms(whitelist: string[]) {
		if (whitelist.some((term) => term.length === 0)) {
			throw new Error('Whitelisted term set contains empty string; this is unsupported.');
		}
	}
}

/**
 * Options for the [[RegExpMatcher]].
 */
export interface RegExpMatcherOptions {
	/**
	 * A set of transformers that should be applied to the input text before
	 * blacklisted patterns are matched. This does not affect the matching of
	 * whitelisted terms.
	 *
	 * Transformers will be applied in the order they appear.
	 *
	 * @default []
	 */
	blacklistMatcherTransformers?: TransformerContainer[];

	/**
	 * A list of blacklisted terms.
	 */
	blacklistedTerms: BlacklistedTerm[];

	/**
	 * A set of transformers that should be applied to the input text before
	 * whitelisted terms are matched. This does not affect the matching of
	 * blacklisted terms.
	 *
	 * Transformers will be applied in the order they appear.
	 *
	 * @default []
	 */
	whitelistMatcherTransformers?: TransformerContainer[];

	/**
	 * A list of whitelisted terms. If a whitelisted term matches some part of
	 * the text, a match of a blacklisted pattern within that part of the text
	 * will not be emitted.
	 *
	 * For example, if we had a pattern `penis` and a whitelisted term `pen is`,
	 * only no matches would be reported for the input text `the pen is mightier
	 * than the sword.`
	 *
	 * @default []
	 */
	whitelistedTerms?: string[];
}

interface CompiledBlacklistedTerm {
	id: number;
	regExp: RegExp;
}
