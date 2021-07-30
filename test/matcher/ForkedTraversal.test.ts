import { ForkedTraversal, ForkedTraversalResponse } from '../../src/matcher/ForkedTraversal';
import { SyntaxKind } from '../../src/pattern/Nodes';

const partialData = {
	patternId: -1,
	preFragmentMatchLength: 2,
	flags: 0,
};

describe('consume()', () => {
	it('should accept anything for wildcards', () => {
		const t = new ForkedTraversal({
			...partialData,
			nodes: [{ kind: SyntaxKind.Wildcard }, { kind: SyntaxKind.Wildcard }, { kind: SyntaxKind.Wildcard }],
		});
		expect(t.consume(1)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(54949)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(3983838)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return pong if still matching', () => {
		const t = new ForkedTraversal({
			...partialData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [2, 3, 4] },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
			],
		});
		expect(t.consume(5)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(2)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(3)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(4)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(4000)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(3)).toBe(ForkedTraversalResponse.Pong);
		expect(t.consume(4)).toBe(ForkedTraversalResponse.Pong);
	});

	it('should return foundmatch if it consumed everything successfully (end with wildcard)', () => {
		const t = new ForkedTraversal({
			...partialData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
				{ kind: SyntaxKind.Wildcard },
			],
		});
		t.consume(1);
		t.consume(100);
		t.consume(3);
		t.consume(4);
		t.consume(5);
		expect(t.consume(300)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return foundmatch if it consumed everything successfully (end with literal)', () => {
		const t = new ForkedTraversal({
			...partialData,
			nodes: [
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Wildcard },
				{ kind: SyntaxKind.Literal, chars: [3, 4, 5] },
			],
		});
		t.consume(1);
		t.consume(100);
		t.consume(3);
		t.consume(4);
		expect(t.consume(5)).toBe(ForkedTraversalResponse.FoundMatch);
	});

	it('should return destroy if a match is impossible', () => {
		const t = new ForkedTraversal({
			...partialData,
			nodes: [{ kind: SyntaxKind.Literal, chars: [1, 2, 3] }, { kind: SyntaxKind.Wildcard }],
		});
		expect(t.consume(400)).toBe(ForkedTraversalResponse.Destroy);
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
