/**
 * Custom error thrown by the parser when syntactical errors are detected.
 */
export class ParserError extends Error {
	public readonly name = 'ParserError';

	/**
	 * The line on which the error occurred (one-based).
	 */
	public readonly line: number;

	/**
	 * The column on which the error occurred (one-based).
	 * Note that surrogate pairs are counted as 1 column wide, not 2.
	 */
	public readonly column: number;

	public constructor(message: string, line: number, column: number) {
		super(`${line}:${column}: ${message}`);
		this.line = line;
		this.column = column;
	}
}
