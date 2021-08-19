import { assignIncrementingIds } from '../matcher/BlacklistedTerm';
import { MatchPayload } from '../matcher/MatchPayload';
import { PatternMatcherOptions } from '../matcher/PatternMatcher';
import { ParsedPattern } from '../pattern/Nodes';

/**
 * Holds phrases (groups of patterns and whitelisted terms), optionally
 * associating metadata with them.
 *
 * @typeParam MetadataType - Metadata type for phrases. Note that the metadata
 * type is implicitly nullable.
 */
export class DataSet<MetadataType> {
	private readonly containers: PhraseContainer<MetadataType>[] = [];
	private patternCount = 0;
	private patternIdToPhraseOffset = new Map<number, number>(); // pattern ID => index of its container

	/**
	 * Adds all the phrases from the dataset provided to this one.
	 *
	 * @example
	 * ```typescript
	 * const customDataset = new DataSet().addAll(englishDataset);
	 * ```
	 *
	 * @param other - Other dataset.
	 */
	public addAll(other: DataSet<MetadataType>) {
		for (const container of other.containers) this.registerContainer(container);
		return this;
	}

	/**
	 * Adds a phrase to this dataset.
	 *
	 * @example
	 * ```typescript
	 * const data = new DataSet()
	 * 	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'fuck' })
	 * 		.addPattern(pattern`fuck`)
	 * 		.addPattern(pattern`f[?]ck`)
	 * 		.addWhitelistedTerm('Afck'))
	 * 	.build();
	 * ```
	 *
	 * @param fn - A function that takes a [[PhraseBuilder]], adds
	 * patterns/whitelisted terms/metadata to it, then returns it.
	 */
	public addPhrase(fn: (builder: PhraseBuilder<MetadataType>) => PhraseBuilder<MetadataType>) {
		const container = fn(new PhraseBuilder()).build();
		this.registerContainer(container);
		return this;
	}

	/**
	 * Retrieves the phrase metadata associated with a pattern and returns a
	 * copy of the match payload with said metadata attached to it.
	 *
	 * @example
	 * ```typescript
	 * const matches = matcher.setInput(input).getAllMatches();
	 * const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
	 * // Now we can access the 'phraseMetadata' property:
	 * const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
	 * ```
	 *
	 * @param payload - Original match payload.
	 */
	public getPayloadWithPhraseMetadata(payload: MatchPayload): MatchPayloadWithPhraseMetadata<MetadataType> {
		const offset = this.patternIdToPhraseOffset.get(payload.termId);
		if (offset === undefined) {
			throw new Error(`The pattern with ID ${payload.termId} does not exist in this dataset.`);
		}

		return {
			...payload,
			phraseMetadata: this.containers[offset].metadata,
		};
	}

	/**
	 * Returns the dataset in a format suitable for usage with the [[PatternMatcher]].
	 *
	 * @example
	 * ```typescript
	 * const matcher = new PatternMatcher({
	 * 	...dataset.build(),
	 * 	// your additional options here
	 * });
	 * ```
	 */
	public build(): Pick<PatternMatcherOptions, 'blacklistedPatterns' | 'whitelistedTerms'> {
		return {
			blacklistedPatterns: assignIncrementingIds(this.containers.flatMap((p) => p.patterns)),
			whitelistedTerms: this.containers.flatMap((p) => p.whitelistedTerms),
		};
	}

	private registerContainer(container: PhraseContainer<MetadataType>) {
		const offset = this.containers.push(container) - 1;
		for (let i = 0, phraseId = this.patternCount; i < container.patterns.length; i++, phraseId++) {
			this.patternIdToPhraseOffset.set(phraseId, offset);
			this.patternCount++;
		}
	}
}

/**
 * Builder for phrases.
 */
export class PhraseBuilder<MetadataType> {
	private readonly patterns: ParsedPattern[] = [];
	private readonly whitelistedTerms: string[] = [];
	private metadata?: MetadataType;

	/**
	 * Registers a pattern with the phrase.
	 *
	 * @param pattern - Pattern to add.
	 */
	public addPattern(pattern: ParsedPattern) {
		this.patterns.push(pattern);
		return this;
	}

	/**
	 * Registers a whitelisted pattern with the phrase.
	 *
	 * @param term - Whitelisted term to add.
	 */
	public addWhitelistedTerm(term: string) {
		this.whitelistedTerms.push(term);
		return this;
	}

	/**
	 * Associates some metadata with the phrase.
	 *
	 * @param metadata - Metadata to use.
	 */
	public setMetadata(metadata?: MetadataType) {
		this.metadata = metadata;
		return this;
	}

	/**
	 * Builds the phrase.
	 */
	public build() {
		return {
			patterns: this.patterns,
			whitelistedTerms: this.whitelistedTerms,
			metadata: this.metadata,
		};
	}
}

/**
 * Extends the default match payload with phrase metadata.
 */
export interface MatchPayloadWithPhraseMetadata<MetadataType> extends MatchPayload {
	/**
	 * Phrase metadata associated with the pattern that matched.
	 */
	phraseMetadata?: MetadataType;
}

interface PhraseContainer<MetadataType> {
	patterns: ParsedPattern[];
	whitelistedTerms: string[];
	metadata?: MetadataType;
}
