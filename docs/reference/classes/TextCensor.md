[**obscenity**](../README.md)

***

[obscenity](../README.md) / TextCensor

# Class: TextCensor

Defined in: [src/censor/TextCensor.ts:9](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/censor/TextCensor.ts#L9)

Censors regions of text matched by a [[Matcher]], supporting flexible
[[TextCensorStrategy | censoring strategies]].

## Constructors

### Constructor

> **new TextCensor**(): `TextCensor`

#### Returns

`TextCensor`

## Methods

### applyTo()

> **applyTo**(`input`, `matches`): `string`

Defined in: [src/censor/TextCensor.ts:66](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/censor/TextCensor.ts#L66)

Applies the censoring strategy to the text, returning the censored text.

**Overlapping regions**

Overlapping regions are an annoying edge case to deal with when censoring
text. There is no single best way to handle them, but the implementation
of this method guarantees that overlapping regions will always be
replaced, following the rules below:

- Replacement text for matched regions will be generated in the order
  specified by [[compareMatchByPositionAndId]];
- When generating replacements for regions that overlap at the start with
  some other region, the start index of the censor context passed to the
  censoring strategy will be the end index of the first region, plus one.

#### Parameters

##### input

`string`

Input text.

##### matches

[`MatchPayload`](../interfaces/MatchPayload.md)[]

A list of matches.

#### Returns

`string`

The censored text.

***

### setStrategy()

> **setStrategy**(`strategy`): `TextCensor`

Defined in: [src/censor/TextCensor.ts:41](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/censor/TextCensor.ts#L41)

Sets the censoring strategy, which is responsible for generating
replacement text for regions of the text that should be censored.

The default censoring strategy is the [[grawlixCensorStrategy]],
generating text like `$%@*`. There are several other built-in strategies
available:
- [[keepStartCensorStrategy]] - extends another strategy and keeps the
  first character matched, e.g. `f***`.
- [[keepEndCensorStrategy]] - extends another strategy and keeps the last
  character matched, e.g. `***k`.
- [[asteriskCensorStrategy]] - replaces the text with asterisks, e.g.
  `****`.
- [[grawlixCensorStrategy]] - the default strategy, discussed earlier.

Note that since censoring strategies are just functions (see the
documentation for [[TextCensorStrategy]]), it is relatively simple to
create your own.

To ease creation of common censoring strategies, we provide a number of
utility functions:
- [[fixedPhraseCensorStrategy]] - generates a fixed phrase, e.g. `fudge`.
- [[fixedCharCensorStrategy]] - generates replacement strings constructed
  from the character given, repeated as many times as needed.
- [[randomCharFromSetCensorStrategy]] - generates replacement strings
  made up of random characters from the set of characters provided.

#### Parameters

##### strategy

[`TextCensorStrategy`](../type-aliases/TextCensorStrategy.md)

Text censoring strategy to use.

#### Returns

`TextCensor`
