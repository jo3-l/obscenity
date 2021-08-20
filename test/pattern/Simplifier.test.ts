import type { Node } from '../../src/pattern/Nodes';
import { SyntaxKind } from '../../src/pattern/Nodes';
import { simplify } from '../../src/pattern/Simplifier';

describe('simplify()', () => {
	it('should leave patterns without optional nodes as-is, disregarding literal node merging', () => {
		const nodes: Node[] = [
			{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4] },
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Literal, chars: [2, 3, 4, 5] },
		];
		expect(simplify(nodes)).toStrictEqual([nodes]);
	});

	describe('optional node expansion', () => {
		it('should create two variations of the pattern whenever an optional node is seen (simple version, only 1 optional node)', () => {
			const node0: Node = { kind: SyntaxKind.Literal, chars: [1, 2, 3, 4] };
			const childNode: Node = { kind: SyntaxKind.Wildcard };
			const node1: Node = { kind: SyntaxKind.Optional, childNode };
			const node2: Node = { kind: SyntaxKind.Wildcard };
			expect(simplify([node0, node1, node2])).toBePermutationOf([
				[node0, node2],
				[node0, childNode, node2],
			]);
		});

		it('should create two variations of the pattern whenever an optional node is seen (more than 1 optional node present)', () => {
			const node0: Node = { kind: SyntaxKind.Literal, chars: [1, 2, 3, 4] };
			const childNode0: Node = { kind: SyntaxKind.Wildcard };
			const node1: Node = { kind: SyntaxKind.Optional, childNode: childNode0 };
			const node2: Node = { kind: SyntaxKind.Wildcard };
			const childNode1: Node = { kind: SyntaxKind.Wildcard };
			const node3: Node = { kind: SyntaxKind.Optional, childNode: childNode1 };
			const node4: Node = { kind: SyntaxKind.Literal, chars: [2, 3, 4, 5] };
			expect(simplify([node0, node1, node2, node3, node4])).toBePermutationOf([
				[node0, node2, node4],
				[node0, childNode0, node2, node4],
				[node0, childNode0, node2, childNode1, node4],
				[node0, node2, childNode1, node4],
			]);
		});
	});

	describe('literal node merging', () => {
		it('should merge the nodes of runs of literal nodes', () => {
			const nodes: Node[] = [
				{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4] },
				{ kind: SyntaxKind.Literal, chars: [2, 3, 4] },
				{ kind: SyntaxKind.Literal, chars: [3, 4] },

				{ kind: SyntaxKind.Wildcard },

				{ kind: SyntaxKind.Literal, chars: [2, 3] },
				{ kind: SyntaxKind.Literal, chars: [4, 5] },
			];
			expect(simplify(nodes)).toStrictEqual([
				[
					{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4, 2, 3, 4, 3, 4] },
					{ kind: SyntaxKind.Wildcard },
					{ kind: SyntaxKind.Literal, chars: [2, 3, 4, 5] },
				],
			]);
		});

		it('should merge the nodes of runs of literal nodes in variations of patterns', () => {
			const nodes: Node[] = [
				{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4] },
				{ kind: SyntaxKind.Optional, childNode: { kind: SyntaxKind.Literal, chars: [2, 3, 4] } },
				{ kind: SyntaxKind.Literal, chars: [4, 5] },
				{ kind: SyntaxKind.Wildcard },
			];
			expect(simplify(nodes)).toBePermutationOf([
				[{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4, 4, 5] }, { kind: SyntaxKind.Wildcard }],
				[{ kind: SyntaxKind.Literal, chars: [1, 2, 3, 4, 2, 3, 4, 4, 5] }, { kind: SyntaxKind.Wildcard }],
			]);
		});
	});
});
