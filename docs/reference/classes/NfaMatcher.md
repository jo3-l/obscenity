[obscenity](../README.md) / NfaMatcher

# Class: NfaMatcher

An implementation of the [Matcher](../interfaces/Matcher.md) interface using finite automata
techniques.

It is theoretically faster than the [RegExpMatcher](RegExpMatcher.md): the `hasMatch()` and
`getAllMatches()` execute in time proportional only to that of the length of
the input text and the number of matches. In other words, it _theoretically_
should not degrade in performance as you add more terms - matching with 100
and 1000 patterns should have the same performance. It achieves this by
building a heavily modified [Aho-Corasick
automaton](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm) from
the input patterns.

In practice, its high constant factors make it slower than the
[RegExpMatcher](RegExpMatcher.md) until about ~100 patterns, at which point both
implementations have approximately the same performance.

The regular-expression matcher should be preferred to this one if at all
possible, as it uses more memory and is only marginally faster at the scale
most users of this package are expected to use it at. However, it may be
appropriate if:

- You have a large number of patterns (> 100);
- You expect to be matching on long text;
- You have benchmarked the implementations and found the [NfaMatcher](NfaMatcher.md) to be
  noticeably faster.

## Implements

- [`Matcher`](../interfaces/Matcher.md)

## Table of contents

### Constructors

- [constructor](NfaMatcher.md#constructor)

### Methods

- [getAllMatches](NfaMatcher.md#getallmatches)
- [hasMatch](NfaMatcher.md#hasmatch)

## Constructors

### constructor

• **new NfaMatcher**(`__namedParameters`)

Creates a new [NfaMatcher](NfaMatcher.md) with the options given.

**`example`**
```typescript
// Use the options provided by the English preset.
const matcher = new NfaMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

**`example`**
```typescript
// Simple matcher that only has blacklisted patterns.
const matcher = new NfaMatcher({
 blacklistedTerms: assignIncrementingIds([
     pattern`fuck`,
     pattern`f?uck`, // wildcards (?)
     pattern`bitch`,
     pattern`b[i]tch` // optionals ([i] matches either "i" or "")
 ]),
});

// Check whether some string matches any of the patterns.
const doesMatch = matcher.hasMatch('fuck you bitch');
```

**`example`**
```typescript
// A more advanced example, with transformers and whitelisted terms.
const matcher = new NfaMatcher({
 blacklistedTerms: [
     { id: 1, pattern: pattern`penis` },
     { id: 2, pattern: pattern`fuck` },
 ],
 whitelistedTerms: ['pen is'],
 blacklistMatcherTransformers: [
     resolveConfusablesTransformer(), // '🅰' => 'a'
     resolveLeetSpeakTransformer(), // '$' => 's'
     foldAsciiCharCaseTransformer(), // case insensitive matching
	    skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
     collapseDuplicatesTransformer(), // 'aaaa' => 'a'
 ],
});

// Output all matches.
console.log(matcher.getAllMatches('fu.....uuuuCK the pen is mightier than the sword!'));
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`NfaMatcherOptions`](../interfaces/NfaMatcherOptions.md) |

#### Defined in

[src/matcher/nfa/NfaMatcher.ts:157](https://github.com/jo3-l/obscenity/blob/cfc6c99/src/matcher/nfa/NfaMatcher.ts#L157)

## Methods

### getAllMatches

▸ **getAllMatches**(`input`, `sorted?`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Returns all matches of blacklisted terms in the text.

If you only need to check for the presence of a match, and do not need
more specific information about the matches, use the `hasMatch()` method,
which is typically more efficient.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `input` | `string` | `undefined` |
| `sorted` | `boolean` | `false` |

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

#### Implementation of

[Matcher](../interfaces/Matcher.md).[getAllMatches](../interfaces/Matcher.md#getallmatches)

#### Defined in

[src/matcher/nfa/NfaMatcher.ts:190](https://github.com/jo3-l/obscenity/blob/cfc6c99/src/matcher/nfa/NfaMatcher.ts#L190)

___

### hasMatch

▸ **hasMatch**(`input`): `boolean`

Checks whether there is a match for any blacklisted term in the text.

This is more efficient than calling `getAllMatches` and checking the
result, as it stops once it finds a match.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`boolean`

#### Implementation of

[Matcher](../interfaces/Matcher.md).[hasMatch](../interfaces/Matcher.md#hasmatch)

#### Defined in

[src/matcher/nfa/NfaMatcher.ts:184](https://github.com/jo3-l/obscenity/blob/cfc6c99/src/matcher/nfa/NfaMatcher.ts#L184)
