import type { EdgeCollection } from './edge/EdgeCollection';
import { ForwardingEdgeCollection } from './edge/ForwardingEdgeCollection';

export class BlacklistTrieNode {
	public edges: EdgeCollection<this> = new ForwardingEdgeCollection<this>();

	public termId = -1;

	public failureLink!: this;

	public outputLink?: this;

	public partialMatches?: PartialMatchData[]; // partial matches that end at this node

	public flags = 0;
}

export const enum SharedFlag {
	RequireWordBoundaryAtStart = 1,
	RequireWordBoundaryAtEnd = 1 << 1,
}

export const enum NodeFlag {
	RequireWordBoundaryAtStart = 1,
	RequireWordBoundaryAtEnd = 1 << 1,
	MatchLeaf = 1 << 2,
	PartialMatchLeaf = 1 << 3,
}

export const enum PartialMatchFlag {
	RequireWordBoundaryAtStart = 1,
	RequireWordBoundaryAtEnd = 1 << 1,
}

export interface PartialMatchData {
	flags: number;
	leadingWildcardCount: number;
	matchLength: number;
	step: number;
	termId: number;
	trailingWildcardCount: number;
}

export function hashPartialMatch(step: number, termId: number) {
	return `${step}-${termId}`;
}
