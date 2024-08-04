import { test, fc } from '@fast-check/jest';
import type { SourceIndex, TransformedIndex } from '../../src/transformer/TransformerSet';
import { TransformerSet } from '../../src/transformer/TransformerSet';
import type { StatefulTransformer } from '../../src/transformer/Transformers';
import { createSimpleTransformer, createStatefulTransformer } from '../../src/transformer/Transformers';
import { CharacterCode } from '../../src/util/Char';

function charof(c: string) {
	return c.codePointAt(0)!;
}

function expectTransformOutput(ts: TransformerSet, input: string, want: string) {
	const [_, got] = ts.transform(input);
	expect(got).toBe(want);
}

test('no transformers is noop', () => {
	const ts = new TransformerSet([]);
	const input = '☺️ hello world 😁\ude00';
	expectTransformOutput(ts, input, input); // noop
});

test('1 simple transformer', () => {
	const t = createSimpleTransformer((c) => c + 1);
	const ts = new TransformerSet([t]);
	expectTransformOutput(ts, 'abcdefgh', 'bcdefghi');
});

test.prop([fc.oneof(fc.fullUnicodeString(), fc.string16bits())])('operates on code points', (str) => {
	const codepoints = [...str].map((c) => c.codePointAt(0)!);

	const t = jest.fn((c: number) => c);
	const ts = new TransformerSet([createSimpleTransformer(t)]);
	expectTransformOutput(ts, str, str);
	expect(t.mock.calls.map((callArgs) => callArgs[0])).toStrictEqual(codepoints);
});

test('empty input', () => {
	const noop = createSimpleTransformer((c) => c);
	const ts = new TransformerSet([noop]);
	expectTransformOutput(ts, '', '');
});

test('2 simple transformers in sequence', () => {
	const nextletter = createSimpleTransformer((c) => c + 1);
	const swapcase = createSimpleTransformer((c) => c ^ 32);
	const ts = new TransformerSet([nextletter, swapcase]);
	expectTransformOutput(ts, 'abcdefghijk', 'BCDEFGHIJKL');
});

test('returning undefined deletes char', () => {
	const t = createSimpleTransformer((c) => (c === charof('a') ? undefined : c));
	const ts = new TransformerSet([t]);
	const input = 'bbbaaaaaddaeecaaa';
	expectTransformOutput(ts, input, input.replace(/a/g, ''));
});

test('returning undefined short circuits', () => {
	const removeA = createSimpleTransformer((c) => (c === charof('a') ? undefined : c));
	const identity = createSimpleTransformer(jest.fn((c) => c));

	const ts = new TransformerSet([removeA, identity]);

	const input = 'dddaadaadaadd';
	expectTransformOutput(ts, input, input.replace(/a/g, ''));
	expect(identity.transform).not.toHaveBeenCalledWith(charof('a')); // removeA called before identity
	expect(identity.transform).toHaveBeenCalledWith(charof('d')); // prevletter causes d -> c
});

test('1 stateful transformer', () => {
	class RemoveEverySecondChar implements StatefulTransformer {
		private keep = true;

		public transform(c: number) {
			const out = this.keep ? c : undefined;
			this.keep = !this.keep;
			return out;
		}

		public reset() {
			this.keep = true;
		}
	}
	const t = createStatefulTransformer(() => new RemoveEverySecondChar());
	const ts = new TransformerSet([t]);
	expectTransformOutput(ts, 'abcdefgh', 'aceg');
});

test('stateful transformer reset for each call', () => {
	class KeepOnlyFirst implements StatefulTransformer {
		private done = false;

		public transform(c: number) {
			if (this.done) return undefined;
			this.done = true;
			return c;
		}

		public reset() {
			this.done = false;
		}
	}

	const t = createStatefulTransformer(() => new KeepOnlyFirst());
	const ts = new TransformerSet([t]);
	expectTransformOutput(ts, 'abc', 'a');
	expectTransformOutput(ts, '007', '0'); // if transformer not reset, erroneously returns '' since done=true
});

// Generate an array of (source character, transformed character | undefined), which effectively
// defines a source string and a transformed string. Then, verify that each codepoint in the
// transformed string maps to the correct source codepoint.
test.prop([
	fc.array(
		fc.record({
			srcChar: fc.oneof(
				fc.fullUnicode(),
				// lone high surrogate
				fc
					.integer({ min: CharacterCode.HighSurrogateStart, max: CharacterCode.HighSurrogateEnd })
					.map((c) => String.fromCodePoint(c)),
			),
			transformedChar: fc.option(fc.char16bits(), { nil: undefined }),
		}),
	),
])('generates correct transformed-to-source index mapping', (data) => {
	const srcText = data.map((v) => v.srcChar).join('');
	const expectedTransformedText = data.map((v) => v.transformedChar).join('');

	// A transformation that outputs `expectedTransformedText` codepoint by codepoint.
	const transform = {
		i: 0,
		transform() {
			return data[this.i++].transformedChar?.codePointAt(0);
		},
		reset() {
			this.i = 0;
		},
	};
	const ts = new TransformerSet([createStatefulTransformer(() => transform)]);
	const [mapping, transformed] = ts.transform(srcText);
	expect(transformed).toBe(expectedTransformedText);

	let srcTextCursor = 0 as SourceIndex;
	let transformedTextCursor = 0 as TransformedIndex;
	// Ensure that mapping.toSourceSpan(span of transformedChar) == span of srcChar.
	for (const { srcChar, transformedChar } of data) {
		if (transformedChar) {
			expect(
				mapping.toSourceSpan(
					transformedTextCursor,
					(transformedTextCursor + transformedChar.length - 1) as TransformedIndex,
				),
			).toStrictEqual([srcTextCursor, (srcTextCursor + srcChar.length - 1) as SourceIndex]);

			// @ts-expect-error: TS doesn't like incrementing branded numbers
			transformedTextCursor += transformedChar.length as TransformedIndex;
		}

		// @ts-expect-error: see above
		srcTextCursor += srcChar.length as SourceIndex;
	}
});
