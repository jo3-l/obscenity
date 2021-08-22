import { BlacklistTrieNode, hashPartialMatch } from '../../../src/matcher/trie/BlacklistTrieNode';

describe('constructor', () => {
	it('should set edges to an empty edge list', () => {
		expect(new BlacklistTrieNode().edges.size).toBe(0);
	});

	it('should set term id to -1', () => {
		expect(new BlacklistTrieNode().termId).toBe(-1);
	});

	it('should set flags to 0', () => {
		expect(new BlacklistTrieNode().flags).toBe(0);
	});
});

describe('hashPartialMatch()', () => {
	it('should return a string in the format step-termId', () => {
		expect(hashPartialMatch(0, 5)).toBe('0-5');
	});
});
