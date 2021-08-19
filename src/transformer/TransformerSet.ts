import type { TransformerContainer } from './Transformers';
import { TransformerType } from './Transformers';

export class TransformerSet {
	private readonly transformers: TransformerContainer[];

	public constructor(transformers: TransformerContainer[]) {
		this.transformers = transformers;
	}

	public applyTo(char: number) {
		let transformed: number | undefined = char;
		for (const transformer of this.transformers) {
			transformed =
				transformer.type === TransformerType.Simple
					? transformer.transform(transformed)
					: transformer.transformer.transform(transformed);
			if (!transformed) return undefined;
		}

		return transformed;
	}

	public resetAll() {
		for (const transformer of this.transformers) {
			if (transformer.type === TransformerType.Stateful) transformer.transformer.reset();
		}
	}
}
