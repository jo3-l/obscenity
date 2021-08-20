import { ForkedTraversal, ForkedTraversalResponse } from '../../src/matcher/ForkedTraversal';
import { SyntaxKind } from '../../src/pattern/Nodes';

const partialTraversalData = {
	patternId: -1,
	preFragmentMatchLength: 2,
	flags: 0,
};

describe('consume()', () => {
	it('should accept anything for wildcards', () => {
		const traversal = new ForkedTraversal({
			...partialTraversalData,
			nodes: [{ kind: SyntaxKind.Wildcard }, { kind: SyntaxKind.Wildcard }, { kind: SyntaxKind.Wildcard }],
		});
		expect(traversal.consume(1)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(54949)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(3983838)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return pong if still matching', () => {
		const traversal = new ForkedTraversal({
			...partialTraversalData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [2, 3, 4] },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
			],
		});
		expect(traversal.consume(5)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(2)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(3)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(4)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(4000)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(3)).toBe(ForkedTraversalResponse.Pong);
		expect(traversal.consume(4)).toBe(ForkedTraversalResponse.Pong);
	});

	it('should return foundmatch if it consumed everything successfully (end with wildcard)', () => {
		const traversal = new ForkedTraversal({
			...partialTraversalData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
				{ kind: SyntaxKind.Wildcard },
			],
		});
		traversal.consume(1);
		traversal.consume(100);
		traversal.consume(3);
		traversal.consume(4);
		traversal.consume(5);
		expect(traversal.consume(300)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return foundmatch if it consumed everything successfully (end with literal)', () => {
		const traversal = new ForkedTraversal({
			...partialTraversalData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
			],
		});
		traversal.consume(1);
		traversal.consume(100);
		traversal.consume(3);
		traversal.consume(4);
		expect(traversal.consume(5)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return destroy if a match is impossible', () => {
		const traversal = new ForkedTraversal({
			...partialTraversalData,
			nodes: [{ kind: SyntaxKind.Literal, chars: [1, 2, 3] }, { kind: SyntaxKind.Wildcard }],
		});
		expect(traversal.consume(400)).toBe(ForkedTraversalResponse.Destroy);
	});
});

describe('ForkedTraversalResponse', () => {
	describe('ForkedTraversalResponse.Pong', () => {
		it('should be equal to 0', () => {
			expect(ForkedTraversalResponse.Pong).toBe(0);
		});
	});

	describe('ForkedTraversalResponse.Destroy', () => {
		it('should be equal to 1', () => {
			expect(ForkedTraversalResponse.Destroy).toBe(1);
		});
	});

	describe('ForkedTraversalResponse.FoundMatch', () => {
		it('should be equal to 2', () => {
			expect(ForkedTraversalResponse.FoundMatch).toBe(2);
		});
	});
});
