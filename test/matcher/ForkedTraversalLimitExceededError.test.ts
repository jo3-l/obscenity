import { ForkedTraversalLimitExceededError } from '../../src/matcher/ForkedTraversalLimitExceededError';

describe('constructor', () => {
	it('should set the input', () => {
		expect(new ForkedTraversalLimitExceededError('asdf', 0, 0, 0).input).toBe('asdf');
	});

	it('should set the position', () => {
		expect(new ForkedTraversalLimitExceededError('', 1, 0, 0).position).toBe(1);
	});

	it('should set the effective pattern count', () => {
		expect(new ForkedTraversalLimitExceededError('', 0, 5, 0).effectivePatternCount).toBe(5);
	});

	it('should set the forked traversal limit', () => {
		expect(new ForkedTraversalLimitExceededError('', 0, 0, 4).forkedTraversalLimit).toBe(4);
	});
});

describe('ForkedTraversalLimitExceededError#name', () => {
	it('should be equal to ForkedTraversalLimitExceededError', () => {
		expect(new ForkedTraversalLimitExceededError('', 0, 0, 0).name).toBe('ForkedTraversalLimitExceededError');
	});
});
