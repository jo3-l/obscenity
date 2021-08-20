import { getAndAssertSingleCodePoint } from '../../util/Char';
import { createStatefulTransformer } from '../Transformers';
import { CollapseDuplicatesTransformer } from './transformer';

/**
 * Creates a transformer that collapses duplicate characters. This is useful for
 * detecting variants of patterns in which a character is repeated to bypass
 * detection.
 *
 * As an example, the pattern `hi` does not match `hhiii` by default, as the
 * frequency of the characters does not match. With this transformer, `hhiii`
 * would become `hi`, and would therefore match the pattern.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied after all other
 * transformers. Using it before other transformers may have the effect of not
 * catching duplicates of certain characters that were originally different but
 * became the same after a series of transformations.
 *
 * **Warning**
 *
 * This transformer should be used with caution, as while it can make certain
 * patterns match text that wouldn't have been matched before, it can also go
 * the other way. For example, the pattern `hello` clearly matches `hello`, but
 * with this transformer, by default, `hello` would become `helo` which does
 * _not_ match. In this cases, the `customThresholds` option can be used to
 * allow two `l`s in a row, making it leave `hello` unchanged.
 *
 * @example
 * ```typescript
 * // Collapse runs of the same character.
 * const transformer = collapseDuplicatesTransformer();
 * const matcher = new PatternMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 *
 * @example
 * ```typescript
 * // Collapse runs of characters other than 'a'.
 * const transformer = collapseDuplicatesTransformer({ customThresholds: new Map([['a', Infinity]]) });
 * const matcher = new PatternMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 *
 * @param options - Options for the transformer.
 * @returns A container holding the transformer, which can then be passed to the
 * [[PatternMatcher]].
 */
export function collapseDuplicatesTransformer({
	defaultThreshold = 1,
	customThresholds = new Map(),
}: CollapseDuplicatesTransformerOptions = {}) {
	const map = createCharacterToThresholdMap(customThresholds);
	return createStatefulTransformer(
		() => new CollapseDuplicatesTransformer({ defaultThreshold, customThresholds: map }),
	);
}

function createCharacterToThresholdMap(customThresholds: Map<string, number>) {
	const map = new Map<number, number>();
	for (const [str, threshold] of customThresholds) {
		if (threshold < 0) throw new RangeError('Expected all thresholds to be non-negative.');
		const char = getAndAssertSingleCodePoint(str);
		map.set(char, threshold);
	}
	return map;
}

export interface ProcessedCollapseDuplicatesTransformerOptions {
	defaultThreshold: number;
	customThresholds: Map<number, number>;
}

/**
 * Options for the collapse duplicates transformer.
 */
export interface CollapseDuplicatesTransformerOptions {
	/**
	 * The maximum number of characters in a run that will be accepted before
	 * they will be collapsed.
	 *
	 * For example, if this value was `2`, `aa` would stay the same but `aaa`
	 * would be transformed to `aa`.
	 *
	 * @default 1
	 */
	defaultThreshold?: number;

	/**
	 * Custom thresholds for characters. If a character has an entry
	 * corresponding to it, the value of tne entry will be used as the maximum
	 * length of character runs comprised of said character before they are
	 * collapsed.
	 *
	 * The intended use-case for this option is for characters which appear
	 * more than once in a row in patterns. For example, the word `book` has
	 * two `o`s in a row, and matches `book`. With this transformer, though,
	 * `book` would become `bok`, meaning that `book` would no longer match `book`.
	 * The fix would be to add an entry corresponding to `o` that overrides its
	 * threshold to be `2`, with the effect of leaving `book` unchanged.
	 *
	 * @default new Map()
	 */
	customThresholds?: Map<string, number>;
}
