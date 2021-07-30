/**
 * Custom error thrown when the forked traversal limit is exceeded during
 * matching.
 */
export class ForkedTraversalLimitExceededError extends Error {
	public readonly name = 'ForkedTraversalLimitExceededError';

	/**
	 * The input that caused the error.
	 */
	public readonly input: string;

	/**
	 * The position the matcher was on when the error occurred.
	 */
	public readonly position: number;

	/**
	 * The number of expanded patterns used for matching.
	 */
	public readonly effectivePatternCount: number;

	/**
	 * The forked traversal limit.
	 */
	public readonly forkedTraversalLimit: number;

	public constructor(input: string, position: number, effectivePatternCount: number, forkedTraversalLimit: number) {
		super(`Exceeded the forked traversal limit (${forkedTraversalLimit}) when trying to match on the input string '${input}' (length ${input.length}) at position ${position}.
This may happen if you have a large number of patterns containing many wildcards.
To prevent this error, you can either handle it directly using a try-catch construct when calling methods that match on input, or increase the forked traversal limit.

If you believe that this error should not occurred with your configuration, please open an issue.
The following information will be useful to include:
	- Length of the input that caused the error: ${input.length}
	- Position the matcher was at when the limit was exceeded: ${position}
	- Effective number of patterns: ${effectivePatternCount}
	- Forked traversal limit: ${forkedTraversalLimit}
	- The patterns used`);
		this.input = input;
		this.position = position;
		this.effectivePatternCount = effectivePatternCount;
		this.forkedTraversalLimit = forkedTraversalLimit;
	}
}
