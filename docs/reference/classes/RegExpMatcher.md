[**obscenity**](../README.md)

***

[obscenity](../README.md) / RegExpMatcher

# Class: RegExpMatcher

Defined in: [src/matcher/regexp/RegExpMatcher.ts:16](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/regexp/RegExpMatcher.ts#L16)

An implementation of the [[Matcher]] interface using regular expressions and
string searching methods.

## Implements

- [`Matcher`](../interfaces/Matcher.md)

## Constructors

### Constructor

> **new RegExpMatcher**(`options`): `RegExpMatcher`

Defined in: [src/matcher/regexp/RegExpMatcher.ts:74](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/regexp/RegExpMatcher.ts#L74)

Creates a new [[RegExpMatcher]] with the options given.

#### Parameters

##### options

[`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md)

Options to use.

#### Returns

`RegExpMatcher`

#### Examples

```typescript
// Use the options provided by the English preset.
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

```typescript
// Simple matcher that only has blacklisted patterns.
const matcher = new RegExpMatcher({
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

```typescript
// A more advanced example, with transformers and whitelisted terms.
const matcher = new RegExpMatcher({
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

## Methods

### getAllMatches()

> **getAllMatches**(`input`, `sorted`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Defined in: [src/matcher/regexp/RegExpMatcher.ts:87](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/regexp/RegExpMatcher.ts#L87)

Returns all matches of blacklisted terms in the text.

If you only need to check for the presence of a match, and do not need
more specific information about the matches, use the `hasMatch()` method,
which is typically more efficient.

#### Parameters

##### input

`string`

Text to find profanities in.

##### sorted

`boolean` = `false`

Whether the resulting list of matches should be sorted
using [[compareMatchByPositionAndId]]. Defaults to `false`.

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

A list of matches of the matcher on the text. The matches are
guaranteed to be sorted if and only if the `sorted` parameter is `true`,
otherwise, their order is unspecified.

#### Implementation of

[`Matcher`](../interfaces/Matcher.md).[`getAllMatches`](../interfaces/Matcher.md#getallmatches)

***

### hasMatch()

> **hasMatch**(`input`): `boolean`

Defined in: [src/matcher/regexp/RegExpMatcher.ts:120](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/matcher/regexp/RegExpMatcher.ts#L120)

Checks whether there is a match for any blacklisted term in the text.

This is typically more efficient than calling `getAllMatches` and
checking the result, though it depends on the implementation.

#### Parameters

##### input

`string`

Text to check.

#### Returns

`boolean`

#### Implementation of

[`Matcher`](../interfaces/Matcher.md).[`hasMatch`](../interfaces/Matcher.md#hasmatch)
