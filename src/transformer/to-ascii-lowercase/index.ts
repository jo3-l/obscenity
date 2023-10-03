import { invertCaseOfAlphabeticChar, isUpperCase } from '../../util/Char';
import { createSimpleTransformer } from '../Transformers';

/**
 * Creates a transformer that changes all ASCII alphabet characters to
 * lower-case, leaving other characters unchanged.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the end of the
 * transformer chain. Using it before other transformers may have the effect of
 * making its changes useless as transformers applied after produce characters
 * of varying cases.
 *
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
export function toAsciiLowerCaseTransformer() {
	return createSimpleTransformer((c) => (isUpperCase(c) ? invertCaseOfAlphabeticChar(c) : c));
}
