[obscenity](../README.md) / RegExpMatcher

# Class: RegExpMatcher

An implementation of the [Matcher](../interfaces/Matcher.md) interface using regular expressions and
string searching methods.

It should be the default choice for users of this package, as though it is
theoretically slower than the more complex [NfaMatcher](NfaMatcher.md), it uses much less
memory and is more efficient for low/medium numbers of patterns.

Refer to the documentation of the [NfaMatcher](NfaMatcher.md) class for further discussion
on when to choose that implementation over this one.

## Implements

- [`Matcher`](../interfaces/Matcher.md)

## Table of contents

### Constructors

- [constructor](RegExpMatcher.md#constructor)

### Methods

- [getAllMatches](RegExpMatcher.md#getallmatches)
- [hasMatch](RegExpMatcher.md#hasmatch)

## Constructors

### constructor

• **new RegExpMatcher**(`__namedParameters`)

Creates a new [RegExpMatcher](RegExpMatcher.md) with the options given.

**`example`**
```typescript
// Use the options provided by the English preset.
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

**`example`**
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

**`example`**
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

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md) |

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:80](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/matcher/regexp/RegExpMatcher.ts#L80)

## Methods

### getAllMatches

▸ **getAllMatches**(`input`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Returns all matches of blacklisted terms in the text.

If you only need to check for the presence of a match, and do not need
more specific information about the matches, use the `hasMatch()` method,
which is typically more efficient.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

#### Implementation of

[Matcher](../interfaces/Matcher.md).[getAllMatches](../interfaces/Matcher.md#getallmatches)

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:98](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/matcher/regexp/RegExpMatcher.ts#L98)

___

### hasMatch

▸ **hasMatch**(`input`): `boolean`

Checks whether there is a match for any blacklisted term in the text.

This is typically more efficient than calling `getAllMatches` and
checking the result, though it depends on the implementation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`boolean`

#### Implementation of

[Matcher](../interfaces/Matcher.md).[hasMatch](../interfaces/Matcher.md#hasmatch)

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:129](https://github.com/jo3-l/obscenity/blob/ba53cd3/src/matcher/regexp/RegExpMatcher.ts#L129)
