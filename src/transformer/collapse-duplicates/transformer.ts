import { ProcessedCollapseDuplicatesTransformerOptions } from '.';
import { StatefulTransformer } from '../Transformers';

export class CollapseDuplicatesTransformer implements StatefulTransformer {
	private readonly defaultThreshold: number;
	private readonly customThresholds: Map<number, number>;
	private remaining = -1;
	private lastChar = -1;

	public constructor({ defaultThreshold, customThresholds }: ProcessedCollapseDuplicatesTransformerOptions) {
		this.defaultThreshold = defaultThreshold;
		this.customThresholds = customThresholds;
	}

	public transform(char: number) {
		if (char === this.lastChar) {
			return this.remaining-- > 0 ? char : undefined;
		}

		const threshold = this.customThresholds.get(char) ?? this.defaultThreshold;
		this.remaining = threshold - 1;
		this.lastChar = char;
		return threshold > 0 ? char : undefined;
	}

	public reset() {
		this.remaining = -1;
		this.lastChar = -1;
	}
}
