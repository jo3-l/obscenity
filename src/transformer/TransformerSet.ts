import type { StatefulTransformer, TransformerContainer } from './Transformers';
import { TransformerType } from './Transformers';

export class TransformerSet {
	private readonly transformers: TransformerContainer[];

	private readonly statefulTransformers: (StatefulTransformer | undefined)[];

	// The last character each transformer was given and let through.
	private readonly lastKeptInputs: (number | undefined)[];

	private droppedAsRepeat = false;

	public constructor(transformers: TransformerContainer[]) {
		this.transformers = transformers;
		this.statefulTransformers = Array.from({ length: this.transformers.length });
		this.lastKeptInputs = Array.from({ length: this.transformers.length });
		for (let i = 0; i < this.transformers.length; i++) {
			const transformer = this.transformers[i];
			if (transformer.type === TransformerType.Stateful) {
				this.statefulTransformers[i] = transformer.factory();
			}
		}
	}

	public applyTo(char: number) {
		this.droppedAsRepeat = false;
		let transformed: number | undefined = char;
		for (let i = 0; i < this.transformers.length && transformed !== undefined; i++) {
			const input: number = transformed;
			const transformer = this.transformers[i];
			if (transformer.type === TransformerType.Simple) transformed = transformer.transform(input);
			else transformed = this.statefulTransformers[i]!.transform(input);

			if (transformed === undefined) this.droppedAsRepeat = input === this.lastKeptInputs[i];
			else this.lastKeptInputs[i] = input;
		}

		return transformed;
	}

	/**
	 * Whether the character last passed to `applyTo()` was dropped by a
	 * transformer that had just let the same character through, as happens when
	 * duplicates are collapsed. Such a character is a continuation of the one
	 * before it rather than a character that was skipped.
	 */
	public lastCharWasDroppedAsRepeat() {
		return this.droppedAsRepeat;
	}

	public resetAll() {
		this.droppedAsRepeat = false;
		this.lastKeptInputs.fill(undefined);
		for (let i = 0; i < this.transformers.length; i++) {
			if (this.transformers[i].type === TransformerType.Stateful) {
				this.statefulTransformers[i]!.reset();
			}
		}
	}
}
