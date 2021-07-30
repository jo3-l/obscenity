import { invertCaseOfAlphabeticChar, isUpperCase } from '../../util/Char';
import { createSimpleTransformer } from '../Transformers';

/**
 * Creates a transformer that folds the case of ASCII alphabet characters, leaving other
 * characters unchanged. Using this transformer effectively makes the pattern-matching process
 * case-insensitive.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the end of the transformer chain.
 * Using it before other transformers may have the effect of making its changes useless as
 * transformers applied after produce characters of varying cases.
 *
 * @returns A container holding the transformer, which can then be passed to the [[PatternMatcher]].
 */
export function foldAsciiCharCaseTransformer() {
	return createSimpleTransformer((c) => (isUpperCase(c) ? invertCaseOfAlphabeticChar(c) : c));
}
