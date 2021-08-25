import { DataSet } from '../dataset/DataSet';
import type { PatternMatcherOptions } from '../matcher/PatternMatcher';
import { pattern } from '../pattern/Pattern';
import { collapseDuplicatesTransformer } from '../transformer/collapse-duplicates';
import { resolveConfusablesTransformer } from '../transformer/resolve-confusables';
import { resolveLeetSpeakTransformer } from '../transformer/resolve-leetspeak';
import { skipNonAlphabeticTransformer } from '../transformer/skip-non-alphabetic';
import { toAsciiLowerCaseTransformer } from '../transformer/to-ascii-lowercase';

/**
 * A set of transformers to be used when matching blacklisted patterns with the
 * [[englishDataset | english word dataset]].
 */
export const englishRecommendedBlacklistMatcherTransformers = [
	resolveConfusablesTransformer(),
	resolveLeetSpeakTransformer(),
	toAsciiLowerCaseTransformer(),
	skipNonAlphabeticTransformer(),
	collapseDuplicatesTransformer({
		defaultThreshold: 1,
		customThresholds: new Map([
			['b', 2], // a_bb_o
			['e', 2], // ab_ee_d
			['o', 2], // b_oo_nga
			['l', 2], // fe_ll_atio
			['s', 2], // a_ss_
			['g', 2], // ni_gg_er
		]),
	}),
];

/**
 * A set of transformers to be used when matching whitelisted terms with the
 * [[englishDataset | english word dataset]].
 */
export const englishRecommendedWhitelistMatcherTransformers = [
	toAsciiLowerCaseTransformer(),
	collapseDuplicatesTransformer({
		defaultThreshold: Infinity,
		customThresholds: new Map([[' ', 1]]), // collapse spaces
	}),
];

/**
 * Recommended transformers to be used with the [[englishDataset | english word
 * dataset]] and the [[PatternMatcher]].
 */
export const englishRecommendedTransformers: Pick<
	PatternMatcherOptions,
	'blacklistMatcherTransformers' | 'whitelistMatcherTransformers'
> = {
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
};

/**
 * A dataset of profane English words.
 *
 * @example
 * ```typescript
 * const matcher = new PatternMatcher({
 * 	...englishDataset.build(),
 * 	...englishRecommendedTransformers,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Extending the data-set by adding a new word and removing an existing one.
 * const myDataset = new DataSet()
 * 	.addAll(englishDataset)
 * 	.removePhrasesIf((phrase) => phrase.metadata.displayName === 'vagina')
 * 	.addPhrase((phrase) => phrase.addPattern(pattern`|balls|`));
 * ```
 *
 * @copyright
 * The words are taken from the [cuss](https://github.com/words/cuss) project,
 * with some modifications.
 *
 * ```text
 * (The MIT License)
 *
 * Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ```
 */
export const englishDataset = new DataSet<{ displayName: ProfaneWordDisplayName }>()
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'abbo' })
			.addPattern(pattern`abbo`)
			.addWhitelistedTerm('abbot'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'abeed' }).addPattern(pattern`ab[b]eed`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'africoon' }).addPattern(pattern`africoon`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'anal' })
			.addPattern(pattern`|anal`)
			.addWhitelistedTerm('analabos')
			.addWhitelistedTerm('analagous')
			.addWhitelistedTerm('analav')
			.addWhitelistedTerm('analy')
			.addWhitelistedTerm('analog')
			.addWhitelistedTerm('an al')
			.addPattern(pattern`danal`)
			.addPattern(pattern`eanal`)
			.addPattern(pattern`fanal`)
			.addWhitelistedTerm('fan al')
			.addPattern(pattern`ganal`)
			.addWhitelistedTerm('gan al')
			.addPattern(pattern`ianal`)
			.addWhitelistedTerm('ian al')
			.addPattern(pattern`janal`)
			.addWhitelistedTerm('trojan al')
			.addPattern(pattern`kanal`)
			.addPattern(pattern`lanal`)
			.addWhitelistedTerm('lan al')
			.addPattern(pattern`lanal`)
			.addWhitelistedTerm('lan al')
			.addPattern(pattern`oanal|`)
			.addPattern(pattern`panal`)
			.addWhitelistedTerm('pan al')
			.addPattern(pattern`qanal`)
			.addPattern(pattern`ranal`)
			.addPattern(pattern`sanal`)
			.addPattern(pattern`tanal`)
			.addWhitelistedTerm('tan al')
			.addPattern(pattern`uanal`)
			.addWhitelistedTerm('uan al')
			.addPattern(pattern`vanal`)
			.addWhitelistedTerm('van al')
			.addPattern(pattern`wanal`)
			.addPattern(pattern`xanal`)
			.addWhitelistedTerm('texan al')
			.addPattern(pattern`yanal`)
			.addPattern(pattern`zanal`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'anus' })
			.addPattern(pattern`anus`)
			.addWhitelistedTerm('an us')
			.addWhitelistedTerm('tetanus')
			.addWhitelistedTerm('uranus')
			.addWhitelistedTerm('janus')
			.addWhitelistedTerm('manus'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'arabush' }).addPattern(pattern`arab[b]ush`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'arse' })
			.addPattern(pattern`|ars[s]e`)
			.addWhitelistedTerm('arsen'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'ass' })
			.addPattern(pattern`|ass`)
			.addWhitelistedTerm('assa')
			.addWhitelistedTerm('assem')
			.addWhitelistedTerm('assen')
			.addWhitelistedTerm('asser')
			.addWhitelistedTerm('asset')
			.addWhitelistedTerm('assev')
			.addWhitelistedTerm('assi')
			.addWhitelistedTerm('assoc')
			.addWhitelistedTerm('assoi')
			.addWhitelistedTerm('assu'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'bestiality' }).addPattern(pattern`be[e]s[s]tial`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'bastard' }).addPattern(pattern`bas[s]tard`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'boob' }).addPattern(pattern`boob`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'boonga' })
			.addPattern(pattern`boonga`)
			.addWhitelistedTerm('baboon ga'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'bitch' })
			.addPattern(pattern`bitch`)
			.addPattern(pattern`bich|`),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'blowjob' }).addPattern(pattern`b[b]l[l][o]wj[o]b`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'chingchong' }).addPattern(pattern`chingchong`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'chink' })
			.addPattern(pattern`chink`)
			.addWhitelistedTerm('chin k'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'cock' })
			.addPattern(pattern`|cock|`)
			.addPattern(pattern`|cocks`)
			.addPattern(pattern`|cockp`)
			.addPattern(pattern`|cocke[e]|`)
			.addWhitelistedTerm('cockney'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'cum' })
			.addPattern(pattern`|cum`)
			.addWhitelistedTerm('cumu')
			.addWhitelistedTerm('cumb'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'cunt' }).addPattern(pattern`|cunt`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'deepthroat' })
			.addPattern(pattern`deepthro[o]at`)
			.addPattern(pattern`deepthro[o]t`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'dick' })
			.addPattern(pattern`d?ck|`)
			.addPattern(pattern`d?cke[e]s|`)
			.addPattern(pattern`d?cks|`)
			.addPattern(pattern`|dck|`)
			.addPattern(pattern`dick`)
			.addWhitelistedTerm('benedick')
			.addWhitelistedTerm('dickens'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'doggystyle' }).addPattern(pattern`d[o]g[g]ys[s]t[y]l[l]`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'ejaculate' })
			.addPattern(pattern`e[e]jacul`)
			.addPattern(pattern`e[e]jakul`)
			.addPattern(pattern`e[e]acul[l]ate`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'fag' })
			.addPattern(pattern`|fag`)
			.addPattern(pattern`fggot`),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'fellatio' }).addPattern(pattern`f[e][e]llat`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'felch' }).addPattern(pattern`fe[e]l[l]ch`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'fisting' }).addPattern(pattern`fistin`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'fuck' })
			.addPattern(pattern`f[?]ck`)
			.addPattern(pattern`|fk`)
			.addPattern(pattern`|fu|`)
			.addPattern(pattern`|fuk`),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'gangbang' }).addPattern(pattern`g[?]ngbang`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'handjob' }).addPattern(pattern`h[?]ndjob`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'jizz' }).addPattern(pattern`jizz`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'lubejob' }).addPattern(pattern`lubejob`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'masturbate' })
			.addPattern(pattern`m[?]sturbate`)
			.addPattern(pattern`masterbate`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'nigger' })
			.addPattern(pattern`n[i]gger`)
			.addPattern(pattern`n[i]gga`)
			.addPattern(pattern`|nig|`)
			.addPattern(pattern`|nigs|`)
			.addPattern(pattern`?igge`)
			.addWhitelistedTerm('bigge')
			.addWhitelistedTerm('digge')
			.addWhitelistedTerm('rigge')
			.addWhitelistedTerm('snigger'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'orgasm' })
			.addPattern(pattern`[or]gasm`)
			.addWhitelistedTerm('gasma'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'orgy' })
			.addPattern(pattern`orgy`)
			.addPattern(pattern`orgies`)
			.addWhitelistedTerm('porgy'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'porn' })
			.addPattern(pattern`|prn|`)
			.addPattern(pattern`porn`)
			.addWhitelistedTerm('p orna'),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'hentai' }).addPattern(pattern`h[e][e]ntai`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'pussy' }).addPattern(pattern`p[u]ssy`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'vagina' })
			.addPattern(pattern`vagina`)
			.addPattern(pattern`|v[?]gina`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'penis' })
			.addPattern(pattern`pe[e]nis`)
			.addPattern(pattern`|pnis`)
			.addWhitelistedTerm('pen is'),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'rape' })
			.addPattern(pattern`|rape`)
			.addPattern(pattern`|rapis[s]t`),
	)
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'retard' }).addPattern(pattern`retard`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'scat' }).addPattern(pattern`|s[s]cat|`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'slut' }).addPattern(pattern`s[s]lut`))
	.addPhrase((phrase) => phrase.setMetadata({ displayName: 'semen' }).addPattern(pattern`|s[s]e[e]me[e]n`))
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'sex' })
			.addPattern(pattern`|s[s]e[e]x|`)
			.addPattern(pattern`|s[s]e[e]xy|`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'tit' })
			.addPattern(pattern`|tit|`)
			.addPattern(pattern`|tits|`)
			.addPattern(pattern`|titt`)
			.addPattern(pattern`|tiddies`)
			.addPattern(pattern`|tities`),
	)
	.addPhrase((phrase) =>
		phrase
			.setMetadata({ displayName: 'whore' })
			.addPattern(pattern`|wh[o]re|`)
			.addPattern(pattern`|who[o]res[s]|`)
			.addWhitelistedTerm("who're"),
	);

/**
 * All the profane words that are included in the [[englishDataset | english dataset]] by default.
 */
export type ProfaneWordDisplayName =
	| 'abbo'
	| 'abeed'
	| 'africoon'
	| 'anal'
	| 'anus'
	| 'arabush'
	| 'arse'
	| 'ass'
	| 'bestiality'
	| 'bastard'
	| 'boob'
	| 'boonga'
	| 'bitch'
	| 'blowjob'
	| 'chingchong'
	| 'chink'
	| 'cock'
	| 'cum'
	| 'cunt'
	| 'deepthroat'
	| 'dick'
	| 'doggystyle'
	| 'ejaculate'
	| 'fag'
	| 'fellatio'
	| 'felch'
	| 'fisting'
	| 'fuck'
	| 'gangbang'
	| 'handjob'
	| 'jizz'
	| 'lubejob'
	| 'masturbate'
	| 'nigger'
	| 'orgasm'
	| 'orgy'
	| 'porn'
	| 'hentai'
	| 'pussy'
	| 'vagina'
	| 'penis'
	| 'rape'
	| 'retard'
	| 'scat'
	| 'slut'
	| 'semen'
	| 'sex'
	| 'tit'
	| 'whore';
