import { remapCharactersTransformer } from '../remap-characters';
import { confusables } from './confusables';

/**
 * Creates a transformer that maps confusable Unicode characters to their normalized equivalent.
 * For example, `⓵`, `➊`, and `⑴` are all changed to `1` when using this transformer.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the transformer chain.
 *
 * @example
 * ```typescript
 * const transformer = resolveConfusablesTransformer();
 * const matcher = new PatternMatcher({ ..., blacklistMatcherTransformer: [transformer] });
 * ```
 *
 * @returns A container holding the transformer, which can then be passed to the [[PatternMatcher]].
 */
export function resolveConfusablesTransformer() {
	return remapCharactersTransformer(confusables);
}
