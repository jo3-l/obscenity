import { computePatternMatchLength } from '../../src/pattern/ComputeMatchLength';
import { SyntaxKind } from '../../src/pattern/Nodes';
import { SimpleNode } from '../../src/pattern/Simplifier';

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
