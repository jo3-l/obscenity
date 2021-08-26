/**
 * All the possible transformer types.
 */
export const enum TransformerType {
	Simple,
	Stateful,
}

/**
 * All the possible transformer container types.
 */
export type TransformerContainer = SimpleTransformerContainer | StatefulTransformerContainer;

/**
 * Creates a container holding the transformer function provided.
 * Simple transformers are suitable for stateless transformations, e.g., a
 * transformation that maps certain characters to others. For transformations
 * that need to keep around state, see `createStatefulTransformer`.
 *
 * @example
 * ```typescript
 * function lowercaseToUppercase(char) {
 * 	return isLowercase(char) ? char - 32 : char;
 * }
 *
 * const transformer = createSimpleTransformer(lowercaseToUppercase);
 * const matcher = new PatternMatcher({ ..., transformers: [transformer] });
 * ```
 *
 * @example
 * ```typescript
 * function ignoreAllNonDigitChars(char) {
 * 	return isDigit(char) ? char : undefined;
 * }
 *
 * const transformer = createSimpleTransformer(ignoreAllNonDigitChars);
 * const matcher = new PatternMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 *
 * @param transformer - Function that applies the transformation. It should accept one argument,
 * the input character, and return the transformed character. A return value of `undefined` indicates
 * that the character should be ignored.
 * @returns A container holding the transformer, which can then be passed to the [[PatternMatcher]].
 */
export function createSimpleTransformer(transformer: TransformerFn): SimpleTransformerContainer {
	return { type: TransformerType.Simple, transform: transformer };
}

/**
 * Transforms input characters.
 *
 * @param char - Input character.
 * @returns The transformed character. A return value of `undefined` indicates
 * that the character should be ignored.
 */
export type TransformerFn = (char: number) => number | undefined;

/**
 * Container for simple transformers.
 */
export interface SimpleTransformerContainer {
	type: TransformerType.Simple;

	/**
	 * The transformer function.
	 */
	transform: TransformerFn;
}

/**
 * Creates a container holding the stateful transformer. Stateful transformers
 * are objects which satisfy the `StatefulTransformer` interface. They are
 * suitable for transformations that require keeping around some state regarding
 * the characters previously transformed in the text.
 *
 * @example
 * ```typescript
 * class IgnoreDuplicateCharactersTransformer implements StatefulTransformer {
 * 	private lastChar = -1;
 *
 * 	public transform(char: number) {
 * 		if (char === this.lastChar) return undefined;
 * 		this.lastChar = char;
 * 		return char;
 * 	}
 *
 * 	public reset() {
 * 		this.lastChar = -1;
 * 	}
 * }
 *
 * const transformer = createStatefulTransformer(() => new IgnoreDuplicateCharactersTransformer());
 * const matcher = new PatternMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 *
 * @param factory A function that returns an instance of the stateful transformer.
 * @returns A container holding the stateful transformer, which can then be passed to the [[PatternMatcher]].
 */
export function createStatefulTransformer(factory: StatefulTransformerFactory): StatefulTransformerContainer {
	return { type: TransformerType.Stateful, factory };
}

/**
 * A function that returns an instance of a stateful transformer.
 */
export type StatefulTransformerFactory = () => StatefulTransformer;

/**
 * An interface that stateful transformers should implement.
 */
export interface StatefulTransformer {
	/**
	 * Transforms input characters.
	 *
	 * @param char - Input character.
	 * @returns The transformed character. A return value of `undefined` indicates
	 * that the character should be ignored.
	 */
	transform: TransformerFn;

	/**
	 * Resets the state of the transformer.
	 */
	reset(): void;
}

/**
 * Container for stateful transformers.
 */
export interface StatefulTransformerContainer {
	type: TransformerType.Stateful;
	factory: StatefulTransformerFactory;
}
