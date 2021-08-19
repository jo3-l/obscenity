import { DataSet, PhraseBuilder } from '../../src/dataset/DataSet';
import { pattern } from '../../src/pattern/Pattern';

describe('DataSet#addAll()', () => {
	it('should add all the data from the other dataset to the current one', () => {
		const other = new DataSet()
			.addPhrase((p) =>
				p
					.addPattern(pattern`hi`)
					.addPattern(pattern`yo`)
					.setMetadata(':D'),
			)
			.addPhrase((p) => p.addPattern(pattern`hmm`).addWhitelistedTerm('whitelisted'));
		const cur = new DataSet()
			.addPhrase((p) => p.setMetadata('yodog').addPattern(pattern`hmm2`))
			.addPhrase((p) => p.setMetadata('dude').addPattern(pattern`real`));
		cur.addAll(other);

		const built = cur.build();
		expect(
			other
				.build()
				.blacklistedPatterns.every((p) =>
					built.blacklistedPatterns.some((t) => JSON.stringify(t.pattern) === JSON.stringify(p.pattern)),
				),
		).toBeTruthy();
		expect(built.whitelistedTerms).toStrictEqual(expect.arrayContaining(other.build().whitelistedTerms!));
	});
});

describe('DataSet#addPhrase()', () => {
	it('should pass an instance of PhraseBuilder to the callback', () => {
		const ds = new DataSet();
		ds.addPhrase((builder) => {
			expect(builder).toBeInstanceOf(PhraseBuilder);
			return builder;
		});
	});

	it('should add all the patterns provided to the dataset', () => {
		const p0 = pattern`hi`;
		const p1 = pattern`bye`;
		const p2 = pattern`yo`;
		const ds = new DataSet();
		ds.addPhrase((builder) => builder.addPattern(p0).addPattern(p1).addPattern(p2));
		expect(ds.build().blacklistedPatterns).toStrictEqual([
			{ id: 0, pattern: p0 },
			{ id: 1, pattern: p1 },
			{ id: 2, pattern: p2 },
		]);
	});

	it('should add all the whitelisted terms provided to the dataset', () => {
		const ws = ['a', 'b', 'c', 'd'];
		const ds = new DataSet();
		ds.addPhrase((builder) => {
			for (const w of ws) builder.addWhitelistedTerm(w);
			return builder;
		});
		expect(ds.build().whitelistedTerms).toStrictEqual(ws);
	});
});

describe('DataSet#getPayloadWithPhraseMetadata()', () => {
	const partialData = { startIndex: 0, endIndex: 0, matchLength: 0 };
	it('should throw an error if the pattern ID does not correspond to one in the dataset', () => {
		const ds = new DataSet().addPhrase((p) => p.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		expect(() =>
			ds.getPayloadWithPhraseMetadata({
				termId: 3,
				startIndex: 0,
				endIndex: 0,
				matchLength: 0,
			}),
		).toThrow(new Error('The pattern with ID 3 does not exist in this dataset.'));
	});

	it('should not mutate the original data', () => {
		const ds = new DataSet().addPhrase((p) => p.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		const inp = {
			termId: 0,
			...partialData,
		};
		const cop = { ...inp };
		ds.getPayloadWithPhraseMetadata(inp);
		expect(inp).toStrictEqual(cop);
	});

	it('should return the data with an additional property phraseMetadata', () => {
		const ds = new DataSet().addPhrase((p) => p.addPattern(pattern`hmm.`).setMetadata('hmm metadata'));
		const inp = {
			termId: 0,
			...partialData,
		};
		expect(ds.getPayloadWithPhraseMetadata(inp)).toStrictEqual({
			...inp,
			phraseMetadata: 'hmm metadata',
		});
	});

	it('should use the correct phrase metadata', () => {
		const ds = new DataSet()
			.addPhrase((p) =>
				p
					.addPattern(pattern`hi`)
					.addPattern(pattern`bye`)
					.setMetadata('greetings'),
			)
			.addPhrase((p) =>
				p
					.addPattern(pattern`sad`)
					.addPattern(pattern`happy`)
					.setMetadata('emotion'),
			);
		expect(ds.getPayloadWithPhraseMetadata({ termId: 0, ...partialData })).toStrictEqual({
			termId: 0,
			...partialData,
			phraseMetadata: 'greetings',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 1, ...partialData })).toStrictEqual({
			termId: 1,
			...partialData,
			phraseMetadata: 'greetings',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 2, ...partialData })).toStrictEqual({
			termId: 2,
			...partialData,
			phraseMetadata: 'emotion',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 3, ...partialData })).toStrictEqual({
			termId: 3,
			...partialData,
			phraseMetadata: 'emotion',
		});
	});

	it('should use the correct phrase metadata after merging data from other dataset', () => {
		const ods = new DataSet().addPhrase((p) =>
			p
				.addPattern(pattern`:D`)
				.addPattern(pattern`:(`)
				.setMetadata('emojis'),
		);
		const ds = new DataSet()
			.addPhrase((p) =>
				p
					.addPattern(pattern`hi`)
					.addPattern(pattern`bye`)
					.setMetadata('greetings'),
			)
			.addPhrase((p) =>
				p
					.addPattern(pattern`sad`)
					.addPattern(pattern`happy`)
					.setMetadata('emotion'),
			)
			.addAll(ods);
		expect(ds.getPayloadWithPhraseMetadata({ termId: 0, ...partialData })).toStrictEqual({
			termId: 0,
			...partialData,
			phraseMetadata: 'greetings',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 1, ...partialData })).toStrictEqual({
			termId: 1,
			...partialData,
			phraseMetadata: 'greetings',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 2, ...partialData })).toStrictEqual({
			termId: 2,
			...partialData,
			phraseMetadata: 'emotion',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 3, ...partialData })).toStrictEqual({
			termId: 3,
			...partialData,
			phraseMetadata: 'emotion',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 4, ...partialData })).toStrictEqual({
			termId: 4,
			...partialData,
			phraseMetadata: 'emojis',
		});
		expect(ds.getPayloadWithPhraseMetadata({ termId: 5, ...partialData })).toStrictEqual({
			termId: 5,
			...partialData,
			phraseMetadata: 'emojis',
		});
	});
});

describe('DataSet#build()', () => {
	it('should assign incrementing ids to the patterns', () => {
		const ds = new DataSet()
			.addPhrase((p) => p.addPattern(pattern`hi`).addPattern(pattern`bye`))
			.addPhrase((p) => p.addPattern(pattern`huh`).addPattern(pattern`huhu`));
		expect(ds.build().blacklistedPatterns).toStrictEqual([
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
			const p = new PhraseBuilder();
			p.addPattern(pattern`x`).addPattern(pattern`y`);
			expect(p.build().patterns).toStrictEqual([pattern`x`, pattern`y`]);
		});
	});

	describe('PhraseBuilder#addWhitelistedTerm()', () => {
		it('should add the whitelisted term', () => {
			const p = new PhraseBuilder();
			p.addWhitelistedTerm('x').addWhitelistedTerm('y').addWhitelistedTerm('z');
			expect(p.build().whitelistedTerms).toStrictEqual(['x', 'y', 'z']);
		});
	});

	describe('PhraseBuilder#setMetadata()', () => {
		it('should set the metadata', () => {
			const p = new PhraseBuilder();
			p.setMetadata({ a: 'b' });
			expect(p.build().metadata).toStrictEqual({ a: 'b' });
		});
	});
});
