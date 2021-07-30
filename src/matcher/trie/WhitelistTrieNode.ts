import { EdgeList } from './EdgeList';

export class WhitelistTrieNode {
	public readonly edges = new EdgeList<this>();
	public termId = -1;
	public failureLink!: WhitelistTrieNode;
	public outputLink?: WhitelistTrieNode;
	public isOutputNode = false;
}
