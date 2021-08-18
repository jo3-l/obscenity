import { comparingMatchByPositionAndId, MatchPayload } from '../matcher/MatchPayload';
import { grawlixCensorStrategy } from './BuiltinStrategies';

export class TextCensor {
	private strategy: TextCensorStrategy = grawlixCensorStrategy();

	public setStrategy(strategy: TextCensorStrategy) {
		this.strategy = strategy;
		return this;
	}

	public applyTo(input: string, matches: MatchPayload[]) {
		if (matches.length === 0) return input;
		const sorted = [...matches].sort(comparingMatchByPositionAndId);

		let censored = '';
		let lastIndex = 0;
		for (let i = 0; i < sorted.length; i++) {
			const match = sorted[i];
			if (lastIndex >= match.endIndex) continue; // completely contained in the previous span

			const overlapsAtStart = match.startIndex > lastIndex;
			if (overlapsAtStart) censored += input.slice(lastIndex, match.startIndex);

			const actualStartIndex = Math.max(lastIndex, match.startIndex);
			const overlapsAtEnd =
				i < sorted.length - 1 && // not the last match
				match.endIndex >= sorted[i + 1].startIndex; // end index of this match and start index of next one overlap
			censored += this.strategy({ ...match, startIndex: actualStartIndex, input, overlapsAtStart, overlapsAtEnd });
			lastIndex = match.endIndex + 1;
		}

		censored += input.slice(lastIndex);
		return censored;
	}
}

export type TextCensorStrategy = (ctx: CensorContext) => string;

export interface CensorContext extends MatchPayload {
	input: string;
	overlapsAtStart: boolean;
	overlapsAtEnd: boolean;
}
