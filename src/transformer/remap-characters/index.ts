import { getAndAssertSingleCodePoint } from '../../util/Char';
import { CharacterIterator } from '../../util/CharacterIterator';
import { createSimpleTransformer } from '../Transformers';

/**
 * Maps certain characters to other characters, leaving other characters
 * unchanged.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the
 * transformer chain.
 *
 * @example
 * ```typescript
 * // Transform 'a' to 'b'.
 * const transformer = remapCharactersTransformer({ 'b': 'a' });
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * // Transform '🅱️' to 'b', and use a map instead of an object as the argument.
 * const transformer = remapCharactersTransformer(new Map([['b', '🅱️']]));
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * // Transform '🇴' and '0' to 'o'.
 * const transformer = remapCharactersTransformer({ o: '🇴0' });
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @param mapping - A map/object mapping certain characters to others.
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 * @see [[resolveConfusablesTransformer|  Transformer that handles confusable Unicode characters]]
 * @see [[resolveLeetSpeakTransformer | Transformer that handles leet-speak]]
 */
export function remapCharactersTransformer(mapping: CharacterMapping) {
	const map = createOneToOneMap(mapping);
	return createSimpleTransformer((c) => map.get(c) ?? c);
}

function createOneToOneMap(mapping: CharacterMapping) {
	const map = new Map<number, number>();
	const iterable = mapping instanceof Map ? mapping.entries() : Object.entries(mapping);
	for (const [original, equivalents] of iterable) {
		const originalChar = getAndAssertSingleCodePoint(original);
		const iter = new CharacterIterator(equivalents);
		for (const equivalent of iter) map.set(equivalent, originalChar);
	}

	return map;
}

/**
 * Maps characters to other characters.
 * The key of the map/object should be the transformed character, while the value
 * should be a set of characters that map to the transformed character.
 */
export type CharacterMapping = Map<string, string> | Record<string, string>;
