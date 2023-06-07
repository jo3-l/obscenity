import type { StatefulTransformer, TransformerContainer } from './Transformers';
import { TransformerType } from './Transformers';

export class TransformerSet {
	private readonly transformers: TransformerContainer[];

	private readonly statefulTransformers: (StatefulTransformer | undefined)[];

	public constructor(transformers: TransformerContainer[]) {
		this.transformers = transformers;
		this.statefulTransformers = Array.from({ length: this.transformers.length });
		for (let i = 0; i < this.transformers.length; i++) {
			const transformer = this.transformers[i];
			if (transformer.type === TransformerType.Stateful) {
				this.statefulTransformers[i] = transformer.factory();
			}
		}
	}

	public applyTo(char: number) {
		let transformed: number | undefined = char;
		for (let i = 0; i < this.transformers.length && transformed !== undefined; i++) {
			const transformer = this.transformers[i];
			if (transformer.type === TransformerType.Simple) transformed = transformer.transform(transformed);
			else transformed = this.statefulTransformers[i]!.transform(transformed);
		}

		return transformed;
	}

	public resetAll() {
		for (let i = 0; i < this.transformers.length; i++) {
			if (this.transformers[i].type === TransformerType.Stateful) {
				this.statefulTransformers[i]!.reset();
			}
		}
	}
}
