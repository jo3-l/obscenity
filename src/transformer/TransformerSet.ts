import { CharacterIterator } from '../util/CharacterIterator';
import { isHighSurrogate, isLowSurrogate } from '../util/Char';
import type { StatefulTransformer, TransformerContainer, TransformerFn } from './Transformers';
import { TransformerType } from './Transformers';

// Code that deals with transformations often needs to map between indices into transformed text and
// indices into source text, so define branded types to make confusing the two harder.

export type TransformedIndex = number & { _transformedIndexBrand: string };

export type SourceIndex = number & { _sourceIndexBrand: string };

export class SourceIndexMapping {
	public constructor(public readonly srcIndices: SourceIndex[], private src: string) {}

	/** All indices are inclusive. */
	public toSourceSpan(startIdx: TransformedIndex, endIdx: TransformedIndex): [SourceIndex, SourceIndex] {
		const srcStart = this.srcIndices[startIdx];
		let srcEnd = this.srcIndices[endIdx];
		// If srcEnd points to the first code unit in a surrogate pair (that is, the high surrogate), bump
		// it so that it points to the low surrogate.
		if (
			isHighSurrogate(this.src.charCodeAt(srcEnd)) &&
			srcEnd + 1 < this.src.length &&
			isLowSurrogate(this.src.charCodeAt(srcEnd + 1))
		) {
			srcEnd++;
		}
		return [srcStart, srcEnd];
	}
}

export class TransformerSet {
	private readonly transformers: InstantiatedTransformer[] = [];

	public constructor(transformers: TransformerContainer[]) {
		for (const transformer of transformers) {
			if (transformer.type === TransformerType.Simple) {
				this.transformers.push({ type: TransformerType.Simple, transform: transformer.transform });
			} else {
				this.transformers.push({ type: TransformerType.Stateful, instance: transformer.factory() });
			}
		}
	}

	public transform(sourceText: string): [mapping: SourceIndexMapping, transformedText: string] {
		for (const transformer of this.transformers) {
			if (transformer.type === TransformerType.Stateful) transformer.instance.reset();
		}

		// Goal: for all indices t into the transformed text, srcIndices[t] gives the start index of
		// the source codepoint from which the transformed codepoint was output.
		const srcIndices: SourceIndex[] = [];
		let transformed = '';
		const srcIter = new CharacterIterator(sourceText);
		for (const srcChar of srcIter) {
			const transformedChar = this.transformOne(srcChar);
			if (transformedChar !== undefined) {
				// Before adding the code point,
				//   mapping.length == transformed.length == start index of the code point to be added
				transformed += String.fromCodePoint(transformedChar);
				// After adding the code point,
				//   transformed.length == end index of the added code point, exclusive

				// The indices in between must map to the source index, so update `mapping`
				// accordingly. We need the loop since one code point can encode as more than one
				// UTF-16 code unit.
				while (srcIndices.length < transformed.length) srcIndices.push(srcIter.position as SourceIndex);
			}
		}
		return [new SourceIndexMapping(srcIndices, sourceText), transformed];
	}

	private transformOne(char: number) {
		let out: number | undefined = char;
		for (const transformer of this.transformers) {
			if (transformer.type === TransformerType.Simple) out = transformer.transform(out);
			else out = transformer.instance.transform(out);

			if (out === undefined) break;
		}
		return out;
	}
}

type InstantiatedTransformer =
	| {
			type: TransformerType.Stateful;
			instance: StatefulTransformer;
	  }
	| { type: TransformerType.Simple; transform: TransformerFn };
