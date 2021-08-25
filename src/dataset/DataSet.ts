import { assignIncrementingIds } from '../matcher/BlacklistedTerm';
import type { MatchPayload } from '../matcher/MatchPayload';
import type { PatternMatcherOptions } from '../matcher/PatternMatcher';
import type { ParsedPattern } from '../pattern/Nodes';

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
	private readonly patternIdToPhraseContainer = new Map<number, number>(); // pattern ID => index of its container

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
	 * Removes phrases that match the predicate given.
	 *
	 * @example
	 * ```typescript
	 * const customDataset = new DataSet()
	 * 	.addAll(englishDataset)
	 * 	.removePhrasesIf((phrase) => phrase.metadata.displayName === 'fuck');
	 * ```
	 *
	 * @param predicate - A predicate that determines whether or not a phrase should be removed.
	 * Return `true` to remove, `false` to keep.
	 */
	public removePhrasesIf(predicate: (phrase: PhraseContainer<MetadataType>) => boolean) {
		// Clear the internal state, then gradually rebuild it by adding the
		// containers that should be kept.
		this.patternCount = 0;
		this.patternIdToPhraseContainer.clear();
		const containers = this.containers.splice(0);
		for (const container of containers) {
			const remove = predicate(container);
			if (!remove) this.registerContainer(container);
		}
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
	 * patterns/whitelisted terms/metadata to it, and returns it.
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
	 * const matches = matcher.getAllMatches(input);
	 * const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
	 * // Now we can access the 'phraseMetadata' property:
	 * const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
	 * ```
	 *
	 * @param payload - Original match payload.
	 */
	public getPayloadWithPhraseMetadata(payload: MatchPayload): MatchPayloadWithPhraseMetadata<MetadataType> {
		const offset = this.patternIdToPhraseContainer.get(payload.termId);
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
	public build(): Pick<PatternMatcherOptions, 'blacklistedTerms' | 'whitelistedTerms'> {
		return {
			blacklistedTerms: assignIncrementingIds(this.containers.flatMap((p) => p.patterns)),
			whitelistedTerms: this.containers.flatMap((p) => p.whitelistedTerms),
		};
	}

	private registerContainer(container: PhraseContainer<MetadataType>) {
		const offset = this.containers.push(container) - 1;
		for (let i = 0, phraseId = this.patternCount; i < container.patterns.length; i++, phraseId++) {
			this.patternIdToPhraseContainer.set(phraseId, offset);
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
	 * Associates a pattern with this phrase.
	 *
	 * @param pattern - Pattern to add.
	 */
	public addPattern(pattern: ParsedPattern) {
		this.patterns.push(pattern);
		return this;
	}

	/**
	 * Associates a whitelisted pattern with this phrase.
	 *
	 * @param term - Whitelisted term to add.
	 */
	public addWhitelistedTerm(term: string) {
		this.whitelistedTerms.push(term);
		return this;
	}

	/**
	 * Associates some metadata with this phrase.
	 *
	 * @param metadata - Metadata to use.
	 */
	public setMetadata(metadata?: MetadataType) {
		this.metadata = metadata;
		return this;
	}

	/**
	 * Builds the phrase, returning a [[PhraseContainer]] for use with the
	 * [[DataSet]].
	 */
	public build(): PhraseContainer<MetadataType> {
		return {
			patterns: this.patterns,
			whitelistedTerms: this.whitelistedTerms,
			metadata: this.metadata,
		};
	}
}

/**
 * Extends the default match payload by adding phrase metadata.
 */
export interface MatchPayloadWithPhraseMetadata<MetadataType> extends MatchPayload {
	/**
	 * Phrase metadata associated with the pattern that matched.
	 */
	phraseMetadata?: MetadataType;
}

/**
 * Represents a phrase.
 */
export interface PhraseContainer<MetadataType> {
	/**
	 * Patterns associated with this phrase.
	 */
	patterns: ParsedPattern[];

	/**
	 * Whitelisted terms associated with this phrase.
	 */
	whitelistedTerms: string[];

	/**
	 * Metadata associated with this phrase.
	 */
	metadata?: MetadataType;
}
