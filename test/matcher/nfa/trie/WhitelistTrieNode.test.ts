import { WhitelistTrieNode } from '../../../../src/matcher/nfa/trie/WhitelistTrieNode';

describe('constructor', () => {
	it('should set edges to an empty edge list', () => {
		expect(new WhitelistTrieNode().edges.size).toBe(0);
	});

	it('should set termId to -1', () => {
		expect(new WhitelistTrieNode().termId).toBe(-1);
	});

	it('should set isOutputNode to false', () => {
		expect(new WhitelistTrieNode().isOutputNode).toBeFalsy();
	});
});
