import {
	BlacklistTrieNode,
	BlacklistTrieNodeFlag,
	ForkedTraversalFlag,
	SharedFlag,
} from '../../../src/matcher/trie/BlacklistTrieNode';

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

describe('SharedFlag', () => {
	describe('SharedFlag.RequireWordBoundaryAtStart', () => {
		it('should be equal to 1<<0', () => {
			expect(SharedFlag.RequireWordBoundaryAtStart).toBe(1 << 0);
		});
	});

	describe('SharedFlag.RequireWordBoundaryAtEnd', () => {
		it('should be equal to 1<<1', () => {
			expect(SharedFlag.RequireWordBoundaryAtEnd).toBe(1 << 1);
		});
	});
});

describe('BlacklistTrieNodeFlag', () => {
	describe('BlacklistTrieNodeFlag.RequireWordBoundaryAtStart', () => {
		it('should be equal to 1<<0', () => {
			expect(BlacklistTrieNodeFlag.RequireWordBoundaryAtStart).toBe(1 << 0);
		});
	});

	describe('BlacklistTrieNodeFlag.RequireWordBoundaryAtEnd', () => {
		it('should be equal to 1<<1', () => {
			expect(BlacklistTrieNodeFlag.RequireWordBoundaryAtEnd).toBe(1 << 1);
		});
	});

	describe('BlacklistTrieNodeFlag.IsOutputNode', () => {
		it('should be equal to 1<<2', () => {
			expect(BlacklistTrieNodeFlag.IsOutputNode).toBe(1 << 2);
		});
	});

	describe('BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly', () => {
		it('should be equal to 1<<3', () => {
			expect(BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly).toBe(1 << 3);
		});
	});
});

describe('ForkedTraversalFlag', () => {
	describe('ForkedTraversalFlag.RequireWordBoundaryAtStart', () => {
		it('should be equal to 1<<0', () => {
			expect(ForkedTraversalFlag.RequireWordBoundaryAtStart).toBe(1 << 0);
		});
	});

	describe('ForkedTraversalFlag.RequireWordBoundaryAtEnd', () => {
		it('should be equal to 1<<1', () => {
			expect(ForkedTraversalFlag.RequireWordBoundaryAtEnd).toBe(1 << 1);
		});
	});
});
