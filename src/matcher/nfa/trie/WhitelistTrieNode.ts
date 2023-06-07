import type { EdgeCollection } from './edge/EdgeCollection';
import { ForwardingEdgeCollection } from './edge/ForwardingEdgeCollection';

export class WhitelistTrieNode {
	public edges: EdgeCollection<this> = new ForwardingEdgeCollection<this>();

	public termId = -1;

	public failureLink!: WhitelistTrieNode;

	public outputLink?: WhitelistTrieNode;

	public isOutputNode = false;
}
