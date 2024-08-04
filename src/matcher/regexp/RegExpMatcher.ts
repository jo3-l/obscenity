import { compilePatternToRegExp, potentiallyMatchesEmptyString } from '../../pattern/Util';
import type { SourceIndex, TransformedIndex } from '../../transformer/TransformerSet';
import { TransformerSet } from '../../transformer/TransformerSet';
import type { TransformerContainer } from '../../transformer/Transformers';
import type { BlacklistedTerm } from '../BlacklistedTerm';
import type { MatchPayload } from '../MatchPayload';
import { compareMatchByPositionAndId } from '../MatchPayload';
import type { Matcher } from '../Matcher';

interface CompiledBlacklistedTerm {
	id: number;
	regExp: RegExp;
}

interface WhitelistedSpan {
	start: SourceIndex;
	end: SourceIndex;
}

function isWhitelisted(spans: WhitelistedSpan[], start: SourceIndex, end: SourceIndex) {
	return spans.some((span) => span.start <= start && end <= span.end);
}

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
		const whitelistedSpans = this.getWhitelistedSpans(input);
		const [mapping, transformed] = this.blacklistMatcherTransformers.transform(input);
		const matches: MatchPayload[] = [];
		for (const term of this.blacklistedTerms) {
			for (const match of transformed.matchAll(term.regExp)) {
				const [srcStartIdx, srcEndIdx] = mapping.toSourceSpan(
					match.index! as TransformedIndex,
					(match.index! + match[0].length - 1) as TransformedIndex, // -1 since inclusive
				);

				if (!isWhitelisted(whitelistedSpans, srcStartIdx, srcEndIdx)) {
					matches.push({
						termId: term.id,
						startIndex: srcStartIdx,
						endIndex: srcEndIdx,
						matchLength: [...match[0]].length,
					});
				}
			}
		}

		if (sorted) matches.sort(compareMatchByPositionAndId);
		return matches;
	}

	public hasMatch(input: string) {
		const whitelistedSpans = this.getWhitelistedSpans(input);
		const [mapping, transformed] = this.blacklistMatcherTransformers.transform(input);
		for (const term of this.blacklistedTerms) {
			for (const match of transformed.matchAll(term.regExp)) {
				const [srcStartIdx, srcEndIdx] = mapping.toSourceSpan(
					match.index! as TransformedIndex,
					(match.index! + match[0].length - 1) as TransformedIndex, // -1 since inclusive
				);

				if (!isWhitelisted(whitelistedSpans, srcStartIdx, srcEndIdx)) return true;
			}
		}

		return false;
	}

	private getWhitelistedSpans(input: string) {
		const matches: WhitelistedSpan[] = [];
		const [mapping, transformed] = this.whitelistMatcherTransformers.transform(input);
		for (const term of this.whitelistedTerms) {
			let cursor = 0 as TransformedIndex;
			for (
				let startIdx = transformed.indexOf(term, cursor) as TransformedIndex;
				startIdx !== -1;
				startIdx = transformed.indexOf(term, cursor) as TransformedIndex
			) {
				const [srcStart, srcEnd] = mapping.toSourceSpan(
					startIdx,
					(startIdx + term.length - 1) as TransformedIndex, // -1 since inclusive
				);
				matches.push({ start: srcStart, end: srcEnd });

				cursor = (startIdx + term.length) as TransformedIndex;
			}
		}

		return matches;
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

	private validateWhitelistedTerms(terms: string[]) {
		if (terms.some((t) => t.length === 0)) {
			throw new Error(
				'Empty whitelisted terms are not supported; filter out empty strings before creating the matcher if necessary.',
			);
		}
		return terms;
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
