import { DataSet, PhraseBuilder } from '../../src/dataset/DataSet';
import { pattern } from '../../src/pattern/Pattern';

describe('DataSet#addAll()', () => {
	it('should add all the data from the other dataset to the current one', () => {
		const other = new DataSet()
			.addPhrase((phrase) => phrase.addPattern(pattern`hi`).addPattern(pattern`yo`).setMetadata(':D'))
			.addPhrase((phrase) => phrase.addPattern(pattern`hmm`).addWhitelistedTerm('whitelisted'));
		const dataset = new DataSet()
			.addPhrase((phrase) => phrase.setMetadata('yodog').addPattern(pattern`hmm2`))
			.addPhrase((phrase) => phrase.setMetadata('dude').addPattern(pattern`real`))
			.addAll(other);

		const built = dataset.build();
		expect(
			other
				.build()
				.blacklistedTerms.every((p) =>
					built.blacklistedTerms.some((t) => JSON.stringify(t.pattern) === JSON.stringify(p.pattern)),
				),
		).toBeTruthy();
		expect(built.whitelistedTerms).toStrictEqual(expect.arrayContaining(other.build().whitelistedTerms!));
	});
});

describe('DataSet#addPhrase()', () => {
	it('should pass an instance of PhraseBuilder to the callback', () => {
		new DataSet().addPhrase((builder) => {
			expect(builder).toBeInstanceOf(PhraseBuilder);
			return builder;
		});
	});

	it('should add all the patterns provided to the dataset', () => {
		const firstPattern = pattern`hi`;
		const secondPattern = pattern`bye`;
		const thirdPattern = pattern`yo`;
		const dataset = new DataSet().addPhrase((builder) =>
			builder.addPattern(firstPattern).addPattern(secondPattern).addPattern(thirdPattern),
		);
		expect(dataset.build().blacklistedTerms).toStrictEqual([
			{ id: 0, pattern: firstPattern },
			{ id: 1, pattern: secondPattern },
			{ id: 2, pattern: thirdPattern },
		]);
	});

	it('should add all the whitelisted terms provided to the dataset', () => {
		const terms = ['a', 'b', 'c', 'd'];
		const dataset = new DataSet().addPhrase((builder) => {
			for (const w of terms) builder.addWhitelistedTerm(w);
			return builder;
		});
		expect(dataset.build().whitelistedTerms).toStrictEqual(terms);
	});
});

describe('DataSet#removePhrasesIf()', () => {
	it('should remove phrases that satisfy the predicate', () => {
		const dataset = new DataSet()
			.addPhrase((phrase) =>
				phrase.addPattern(pattern`hi`).addPattern(pattern`bye`).setMetadata('greetings').addWhitelistedTerm('a'),
			)
			.addPhrase((phrase) =>
				phrase
					.addPattern(pattern`morning`)
					.addPattern(pattern`night`)
					.setMetadata('times-of-day')
					.addWhitelistedTerm('b'),
			)
			.addPhrase((phrase) =>
				phrase.addPattern(pattern`sad`).addPattern(pattern`happy`).setMetadata('emotions').addWhitelistedTerm('c'),
			)
			.removePhrasesIf((phrase) => phrase.metadata === 'emotions' || phrase.metadata === 'greetings');
		expect(dataset.build()).toStrictEqual({
			blacklistedTerms: [
				{ id: 0, pattern: pattern`morning` },
				{ id: 1, pattern: pattern`night` },
			],
			whitelistedTerms: ['b'],
		});
	});
});

describe('DataSet#getPayloadWithPhraseMetadata()', () => {
	const partialMatch = { startIndex: 0, endIndex: 0, matchLength: 0 };

	it('should throw an error if the term ID does not correspond to one in the dataset', () => {
		const dataset = new DataSet().addPhrase((phrase) => phrase.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		expect(() =>
			dataset.getPayloadWithPhraseMetadata({
				termId: 3,
				startIndex: 0,
				endIndex: 0,
				matchLength: 0,
			}),
		).toThrow(new Error('The pattern with ID 3 does not exist in this dataset.'));
	});

	it('should not mutate the original data', () => {
		const dataset = new DataSet().addPhrase((phrase) => phrase.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		const originalMatch = {
			termId: 0,
			...partialMatch,
		};
		const originalMatchCopy = { ...originalMatch };
		dataset.getPayloadWithPhraseMetadata(originalMatch);
		expect(originalMatch).toStrictEqual(originalMatchCopy);
	});

	it('should return the data with an additional property phraseMetadata', () => {
		const dataset = new DataSet().addPhrase((phrase) => phrase.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		const match = {
			termId: 0,
			...partialMatch,
		};
		expect(dataset.getPayloadWithPhraseMetadata(match)).toStrictEqual({
			...match,
			phraseMetadata: 'hmm metadata',
		});
	});

	it('should use the correct phrase metadata', () => {
		const dataset = new DataSet()
			.addPhrase((phrase) => phrase.addPattern(pattern`hi`).addPattern(pattern`bye`).setMetadata('greetings'))
			.addPhrase((phrase) => phrase.addPattern(pattern`sad`).addPattern(pattern`happy`).setMetadata('emotion'));
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 0, ...partialMatch })).toStrictEqual({
			termId: 0,
			...partialMatch,
			phraseMetadata: 'greetings',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 1, ...partialMatch })).toStrictEqual({
			termId: 1,
			...partialMatch,
			phraseMetadata: 'greetings',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 2, ...partialMatch })).toStrictEqual({
			termId: 2,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 3, ...partialMatch })).toStrictEqual({
			termId: 3,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
	});

	it('should use the correct phrase metadata after merging data from other dataset', () => {
		const other = new DataSet().addPhrase((phrase) =>
			phrase.addPattern(pattern`:D`).addPattern(pattern`:(`).setMetadata('emojis'),
		);
		const dataset = new DataSet()
			.addPhrase((phrase) => phrase.addPattern(pattern`hi`).addPattern(pattern`bye`).setMetadata('greetings'))
			.addPhrase((phrase) => phrase.addPattern(pattern`sad`).addPattern(pattern`happy`).setMetadata('emotion'))
			.addAll(other);
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 0, ...partialMatch })).toStrictEqual({
			termId: 0,
			...partialMatch,
			phraseMetadata: 'greetings',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 1, ...partialMatch })).toStrictEqual({
			termId: 1,
			...partialMatch,
			phraseMetadata: 'greetings',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 2, ...partialMatch })).toStrictEqual({
			termId: 2,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 3, ...partialMatch })).toStrictEqual({
			termId: 3,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 4, ...partialMatch })).toStrictEqual({
			termId: 4,
			...partialMatch,
			phraseMetadata: 'emojis',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 5, ...partialMatch })).toStrictEqual({
			termId: 5,
			...partialMatch,
			phraseMetadata: 'emojis',
		});
	});

	it('should use the correct phrase metadata after removing certain phrases', () => {
		const dataset = new DataSet()
			.addPhrase((phrase) => phrase.addPattern(pattern`hi`).addPattern(pattern`bye`).setMetadata('greetings'))
			.addPhrase((p) => p.addPattern(pattern`sad`).addPattern(pattern`happy`).setMetadata('emotion'))
			.addPhrase((p) => p.addPattern(pattern`:D`).addPattern(pattern`:(`).setMetadata('emojis'))
			.removePhrasesIf((phrase) => phrase.metadata === 'greetings');
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 0, ...partialMatch })).toStrictEqual({
			termId: 0,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 1, ...partialMatch })).toStrictEqual({
			termId: 1,
			...partialMatch,
			phraseMetadata: 'emotion',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 2, ...partialMatch })).toStrictEqual({
			termId: 2,
			...partialMatch,
			phraseMetadata: 'emojis',
		});
		expect(dataset.getPayloadWithPhraseMetadata({ termId: 3, ...partialMatch })).toStrictEqual({
			termId: 3,
			...partialMatch,
			phraseMetadata: 'emojis',
		});
	});
});

describe('DataSet#build()', () => {
	it('should assign incrementing ids to the patterns', () => {
		const dataset = new DataSet()
			.addPhrase((phrase) => phrase.addPattern(pattern`hi`).addPattern(pattern`bye`))
			.addPhrase((phrase) => phrase.addPattern(pattern`huh`).addPattern(pattern`huhu`));
		expect(dataset.build().blacklistedTerms).toStrictEqual([
			{ id: 0, pattern: pattern`hi` },
			{ id: 1, pattern: pattern`bye` },
			{ id: 2, pattern: pattern`huh` },
			{ id: 3, pattern: pattern`huhu` },
		]);
	});
});

describe('PhraseBuilder', () => {
	describe('PhraseBuilder#addPattern()', () => {
		it('should add the pattern', () => {
			const builder = new PhraseBuilder().addPattern(pattern`x`).addPattern(pattern`y`);
			expect(builder.build().patterns).toStrictEqual([pattern`x`, pattern`y`]);
		});
	});

	describe('PhraseBuilder#addWhitelistedTerm()', () => {
		it('should add the whitelisted term', () => {
			const builder = new PhraseBuilder().addWhitelistedTerm('x').addWhitelistedTerm('y').addWhitelistedTerm('z');
			expect(builder.build().whitelistedTerms).toStrictEqual(['x', 'y', 'z']);
		});
	});

	describe('PhraseBuilder#setMetadata()', () => {
		it('should set the metadata', () => {
			const builder = new PhraseBuilder().setMetadata({ a: 'b' });
			expect(builder.build().metadata).toStrictEqual({ a: 'b' });
		});
	});
});
