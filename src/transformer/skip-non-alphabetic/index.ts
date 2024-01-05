import { isAlphabetic } from '../../util/Char';
import { createSimpleTransformer } from '../Transformers';

/**
 * Creates a transformer that skips non-alphabetic characters (`a`-`z`,
 * `A`-`Z`). This is useful when matching text on patterns that are solely
 * comprised of alphabetic characters (the pattern `hello` does not match
 * `h.e.l.l.o` by default, but does with this transformer).
 *
 * **Warning**
 *
 * This transformation is not part of the default set of transformations, as
 * there are some known rough edges with false negatives; see
 * [#23](https://github.com/jo3-l/obscenity/issues/23) and
 * [#46](https://github.com/jo3-l/obscenity/issues/46) on the GitHub issue
 * tracker.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the end of the
 * transformer chain, if at all.
 *
 * @example
 * ```typescript
 * const transformer = skipNonAlphabeticTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
export function skipNonAlphabeticTransformer() {
	return createSimpleTransformer((c) => (isAlphabetic(c) ? c : undefined));
}
