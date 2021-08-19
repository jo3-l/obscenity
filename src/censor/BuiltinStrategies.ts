import type { CensorContext, TextCensorStrategy } from './TextCensor';

export function keepStartCensorStrategy(baseStrategy: TextCensorStrategy): TextCensorStrategy {
	return (ctx: CensorContext) => {
		if (ctx.overlapsAtStart) return baseStrategy(ctx);
		const firstChar = String.fromCodePoint(ctx.input.codePointAt(ctx.startIndex)!);
		return firstChar + baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 });
	};
}

export function keepEndCensorStrategy(baseStrategy: TextCensorStrategy): TextCensorStrategy {
	return (ctx: CensorContext) => {
		if (ctx.overlapsAtEnd) return baseStrategy(ctx);
		const lastChar = String.fromCodePoint(ctx.input.codePointAt(ctx.endIndex)!);
		return baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 }) + lastChar;
	};
}

export function asteriskCensorStrategy() {
	return fixedCharCensorStrategy('*');
}

export function grawlixCensorStrategy() {
	return randomCharFromSetCensorStrategy('%@$&*');
}

export function fixedPhraseCensorStrategy(phrase: string): TextCensorStrategy {
	return () => phrase;
}

export function fixedCharCensorStrategy(char: string): TextCensorStrategy {
	return (ctx: CensorContext) => char.repeat(ctx.matchLength);
}

export function randomCharFromSetCensorStrategy(charset: string): TextCensorStrategy {
	const chars = [...charset];
	return (ctx: CensorContext) => {
		let censored = '';
		for (let i = 0; i < ctx.matchLength; i++) censored += chars[Math.floor(Math.random() * chars.length)];
		return censored;
	};
}
