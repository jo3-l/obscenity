import type { SimpleNode } from '../../pattern/Simplifier';
import { EdgeList } from './EdgeList';

export class BlacklistTrieNode {
	public readonly edges = new EdgeList<this>();
	public termId = -1;
	public failureLink!: this;
	public outputLink?: this;
	public forkedTraversalLink?: this;
	public forkedTraversals?: ForkedTraversalMetadata[];
	public flags = 0;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SharedFlag = Object.freeze({
	RequireWordBoundaryAtStart: 1 << 0,
	RequireWordBoundaryAtEnd: 1 << 1,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlacklistTrieNodeFlag = Object.freeze({
	...SharedFlag,
	IsOutputNode: 1 << 2,
	SpawnsForkedTraversalsDirectly: 1 << 3,
});

export interface ForkedTraversalMetadata {
	patternId: number;
	preFragmentMatchLength: number;
	flags: number;
	nodes: SimpleNode[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ForkedTraversalFlag = SharedFlag;
