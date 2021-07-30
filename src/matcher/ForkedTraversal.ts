import { SyntaxKind } from '../pattern/Nodes';
import { ForkedTraversalMetadata } from './trie/BlacklistTrieNode';

export class ForkedTraversal {
	public readonly metadata: ForkedTraversalMetadata;
	private nodeIndex = 0;
	private charPosition = 0;

	public constructor(metadata: ForkedTraversalMetadata) {
		this.metadata = metadata;
	}

	public consume(char: number) {
		const node = this.metadata.nodes[this.nodeIndex];
		if (node.kind === SyntaxKind.Wildcard) {
			this.nodeIndex++;
			return this.done ? ForkedTraversalResponse.FoundMatch : ForkedTraversalResponse.Pong;
		}

		const expected = node.chars[this.charPosition++];
		if (char !== expected) return ForkedTraversalResponse.Destroy;
		if (this.charPosition >= node.chars.length) {
			this.nodeIndex++;
			this.charPosition = 0;
		}

		return this.done ? ForkedTraversalResponse.FoundMatch : ForkedTraversalResponse.Pong;
	}

	private get done() {
		return this.nodeIndex >= this.metadata.nodes.length;
	}
}

export const enum ForkedTraversalResponse {
	Pong, // still trying to find a match
	Destroy, // doesn't match, destroy the forked traversal
	FoundMatch, // found match
}
