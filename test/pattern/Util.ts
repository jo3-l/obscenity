import type { LiteralNode } from '../../src/pattern/Nodes';
import { SyntaxKind } from '../../src/pattern/Nodes';
import type { SimpleNode } from '../../src/pattern/Simplifier';
import { computePatternMatchLength, groupByNodeType } from '../../src/pattern/Util';

describe('computePatternMatchLength()', () => {
	it('should return 0 if given an empty array', () => {
		expect(computePatternMatchLength([])).toBe(0);
	});

	it('should return the total number of chars in literal nodes plus 1 for each wildcard node', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Literal, chars: [0, 0] },
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Literal, chars: [0, 0, 0] },
		];
		expect(computePatternMatchLength(nodes)).toBe(6);
	});
});

describe('groupByNodeType()', () => {
	it('should return an empty array if nodes=[]', () => {
		expect(groupByNodeType([])).toStrictEqual([]);
	});

	it('should return one literal group if there are only literal nodes in the input', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Literal, chars: [1, 2, 3] },
			{ kind: SyntaxKind.Literal, chars: [2, 3, 4] },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([{ isLiteralGroup: true, literals: nodes }]);
	});

	it('should return one wildcard group if there are only wildcards in the input', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([{ isLiteralGroup: false, wildcardCount: 3 }]);
	});

	it('should group literals and wildcards together', () => {
		const literal0: LiteralNode = { kind: SyntaxKind.Literal, chars: [1, 2, 3] };
		const literal1: LiteralNode = { kind: SyntaxKind.Literal, chars: [2, 3, 4] };
		const literal2: LiteralNode = { kind: SyntaxKind.Literal, chars: [3, 4, 5] };
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Wildcard },
			literal0,
			literal1,
			{ kind: SyntaxKind.Wildcard },
			literal2,
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([
			{ isLiteralGroup: false, wildcardCount: 1 },
			{ isLiteralGroup: true, literals: [literal0, literal1] },
			{ isLiteralGroup: false, wildcardCount: 1 },
			{ isLiteralGroup: true, literals: [literal2] },
			{ isLiteralGroup: false, wildcardCount: 2 },
		]);
	});
});
