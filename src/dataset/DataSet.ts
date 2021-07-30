import { BlacklistedTerm } from '../matcher/BlacklistedTerm';
import { MatchPayload } from '../matcher/MatchPayload';
import { PatternMatcherOptions } from '../matcher/PatternMatcher';
import { ParsedPattern } from '../pattern/Nodes';

export class DataSet<
	GroupMetadataType = any,
	PhraseMetadataType = any,
	GroupTagType extends PermissibleTagType = string | undefined,
	PhraseTagType extends PermissibleTagType = string | undefined,
> {
	private blacklistedPatterns: BlacklistedTerm[] = [];
	private readonly whitelistedTerms: string[] = [];
	private readonly patternMetadata = new Map<
		number,
		PatternMetadata<GroupMetadataType, PhraseMetadataType, GroupTagType, PhraseTagType>
	>();
	private currentBlacklistedPatternId = 0;

	public addDataFrom(other: DataSet<GroupMetadataType, PhraseMetadataType, GroupTagType, PhraseTagType>) {
		this.whitelistedTerms.push(...other.whitelistedTerms);

		const offset = this.currentBlacklistedPatternId;
		for (const pattern of other.blacklistedPatterns) {
			// Increment the IDs of all patterns so they don't conflict with existing ones in this dataset.
			const actualId = offset + pattern.id;
			this.blacklistedPatterns.push({ ...pattern, id: actualId });
		}
		this.currentBlacklistedPatternId = offset + other.currentBlacklistedPatternId;

		for (const [id, metadata] of other.patternMetadata) {
			Object.assign(this.getOrCreateMetadata(offset + id), metadata);
		}

		return this;
	}

	public addGroup({
		metadata,
		phrases,
		tag,
	}: GroupOptions<GroupMetadataType, PhraseMetadataType, GroupTagType, PhraseTagType>) {
		const ids = phrases.map(this.addPhraseReturningIds).flat(1);
		if (metadata === undefined && tag === undefined) return this;
		for (const id of ids) {
			const metadata = this.getOrCreateMetadata(id);
			metadata.groupTag = tag;
			metadata.groupMetadata = metadata as GroupMetadataType;
		}

		return this;
	}

	public addPhrase(options: PhraseOptions<PhraseMetadataType, PhraseTagType>) {
		this.addPhraseReturningIds(options);
		return this;
	}

	public addWhitelistedTerm(text: string) {
		this.whitelistedTerms.push(text);
		return this;
	}

	public getRichMetadata(match: MatchPayload) {
		return { ...match, ...this.patternMetadata.get(match.termId) };
	}

	public getPatternIdsForPhrases(phraseTags: Iterable<NonNullable<PhraseTagType>>) {
		const set = new Set(phraseTags);
		const patternIds = new Set<number>();
		for (const [patternId, metadata] of this.patternMetadata) {
			if (set.has(metadata.phraseTag!)) patternIds.add(patternId);
		}
		return patternIds;
	}

	public getPatternIdsInGroups(groupTags: Iterable<NonNullable<GroupTagType>>) {
		const set = new Set(groupTags);
		const patternIds: number[] = [];
		for (const [id, metadata] of this.patternMetadata) {
			if (set.has(metadata.groupTag!)) patternIds.push(id);
		}
		return patternIds;
	}

	public removeBlacklistedPhraseGroups(groupTags: Iterable<NonNullable<GroupTagType>>) {
		const set = new Set(groupTags);
		const ids = this.sweep((metadata) => set.has(metadata.groupTag!));
		this.blacklistedPatterns = this.blacklistedPatterns.filter((p) => !ids.has(p.id));
		return this;
	}

	public removeBlacklistedPhrases(phraseTags: Iterable<NonNullable<PhraseTagType>>) {
		const set = new Set(phraseTags);
		const ids = this.sweep((metadata) => set.has(metadata.phraseTag!));
		this.blacklistedPatterns = this.blacklistedPatterns.filter((p) => !ids.has(p.id));
		return this;
	}

	public removePatternsById(ids: Iterable<number>) {
		const set = new Set(ids);
		for (const id of this.patternMetadata.keys()) {
			if (set.has(id)) this.patternMetadata.delete(id);
		}
		this.blacklistedPatterns = this.blacklistedPatterns.filter((p) => !set.has(p.id));
		return this;
	}

	public build(): Pick<PatternMatcherOptions, 'blacklistedPatterns' | 'whitelistedTerms'> {
		return { blacklistedPatterns: this.blacklistedPatterns, whitelistedTerms: this.whitelistedTerms };
	}

	private sweep(
		predicate: (
			metadata: PatternMetadata<GroupMetadataType, PhraseMetadataType, GroupTagType, PhraseTagType>,
		) => boolean,
	) {
		const deleted = new Set<number>();
		for (const [id, metadata] of this.patternMetadata) {
			if (predicate(metadata)) deleted.add(id);
		}
		return deleted;
	}

	private addPhraseReturningIds({ metadata, patterns, tag }: PhraseOptions<PhraseMetadataType, PhraseTagType>) {
		const patternIds: number[] = [];
		for (const pattern of patterns) {
			const patternId = this.currentBlacklistedPatternId++;
			if (metadata !== undefined || tag !== undefined) {
				const patternMetadata = this.getOrCreateMetadata(patternId);
				patternMetadata.phraseMetadata = metadata;
				patternMetadata.phraseTag = tag;
			}

			this.blacklistedPatterns.push({ id: patternId, pattern });
			patternIds.push(patternId);
		}

		return patternIds;
	}

	private getOrCreateMetadata(id: number) {
		let metadata = this.patternMetadata.get(id);
		if (!metadata) this.patternMetadata.set(id, (metadata = {}));
		return metadata;
	}
}

export interface MatchPayloadWithRichMetadata<
	GroupMetadataType,
	PhraseMetadataType,
	GroupTagType extends PermissibleTagType,
	PhraseTagType extends PermissibleTagType,
> extends MatchPayload,
		PatternMetadata<GroupMetadataType, PhraseMetadataType, GroupTagType, PhraseTagType> {}

export type GroupOptions<
	GroupMetadataType,
	PhraseMetadataType,
	GroupTagType extends PermissibleTagType,
	PhraseTagType extends PermissibleTagType,
> = Tagged<
	undefined extends GroupMetadataType
		? { metadata?: GroupMetadataType; phrases: PhraseOptions<PhraseMetadataType, PhraseTagType>[] }
		: { metadata: GroupMetadataType; phrases: PhraseOptions<PhraseMetadataType, PhraseTagType>[] },
	GroupTagType
>;

export type PhraseOptions<PhraseMetadataType, PhraseTagType extends PermissibleTagType> = Tagged<
	undefined extends PhraseMetadataType
		? { metadata?: PhraseMetadataType; patterns: ParsedPattern[] }
		: { metadata: PhraseMetadataType; patterns: ParsedPattern[] },
	PhraseTagType
>;

type Tagged<OriginalType, TagType extends PermissibleTagType> = Expand<
	undefined extends TagType ? OriginalType & { tag?: TagType } : OriginalType & { tag: TagType }
>;

type PermissibleTagType = string | number | bigint | symbol | undefined;

type Expand<T> = T extends infer X ? { [K in keyof X]: X[K] } : T;

interface PatternMetadata<
	GroupMetadataType,
	PhraseMetadataType,
	GroupTagType extends PermissibleTagType,
	PhraseTagType extends PermissibleTagType,
> {
	groupTag?: GroupTagType;
	phraseTag?: PhraseTagType;
	groupMetadata?: GroupMetadataType;
	phraseMetadata?: PhraseMetadataType;
}
