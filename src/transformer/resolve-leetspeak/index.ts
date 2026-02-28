import { getAndAssertSingleCodePoint } from '../../util/Char';
import { CharacterIterator } from '../../util/CharacterIterator';
import { createStatefulTransformer } from '../Transformers';
import type { StatefulTransformer } from '../Transformers';
import { dictionary } from './dictionary';

const ExclamationMark = '!'.charCodeAt(0);
const LowerI = 'i'.charCodeAt(0);

/** Build the standard leet-speak one-to-one char map from the dictionary. */
function buildLeetMap() {
	const map = new Map<number, number>();
	for (const [original, equivalents] of dictionary.entries()) {
		const originalChar = getAndAssertSingleCodePoint(original);
		const iter = new CharacterIterator(equivalents);
		for (const equivalent of iter) map.set(equivalent, originalChar);
	}
	return map;
}

const leetMap = buildLeetMap();

/**
 * Stateful leet-speak transformer.
 *
 * All characters are resolved via the standard dictionary.
 * Additionally, `!` is treated as `i` **only when it appears mid-word**
 * (i.e. the previous character was a word-like character such as a letter
 * or another leet-speak symbol that resolved to a letter).
 * When `!` appears at the end of a word it is left as-is so that regex
 * word-boundary assertions (`\b`) still fire correctly.
 */
class ResolveLeetSpeakTransformer implements StatefulTransformer {
	/** Code-point of the last *output* character (after mapping), or -1 at start/reset. */
	private lastOut = -1;

	public transform(char: number): number | undefined {
		// Only remap '!' → 'i' when it is preceded by specific letters that
		// suggest it's mid-word leet-speak (e.g., d!ck, sh!t, p!ss).
		// We avoid mapping after 'k' or 't' to prevent breaking trailing
		// word boundaries in words like "fuck!" or "shit!".
		if (char === ExclamationMark) {
			const c = this.lastOut;
			// 'b', 'd', 'h', 'i', 'l', 'n', 'p', 's'
			const isMidWordPredecessor =
				c === 98 || c === 100 || c === 104 || c === 105 || c === 108 || c === 110 || c === 112 || c === 115;
			const out = isMidWordPredecessor ? LowerI : ExclamationMark;
			this.lastOut = out;
			return out;
		}

		const mapped = leetMap.get(char) ?? char;
		this.lastOut = mapped;
		return mapped;
	}

	public reset() {
		this.lastOut = -1;
	}
}

/**
 * Creates a transformer that maps leet-speak characters to their normalized
 * equivalent. For example, `$` becomes `s` when using this transformer.
 *
 * `!` is treated as `i` only when it appears **mid-word** (e.g. `d!ck`),
 * so that trailing punctuation such as `fuck!` is still matched correctly
 * by patterns with word-boundary assertions.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the
 * transformer chain, but after similar transformers that map characters to
 * other characters, such as the [[resolveConfusablesTransformer | transformer
 * that resolves confusable Unicode characters]].\
 *
 * @example
 * ```typescript
 * const transformer = resolveLeetSpeakTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
export function resolveLeetSpeakTransformer() {
	return createStatefulTransformer(() => new ResolveLeetSpeakTransformer());
}
