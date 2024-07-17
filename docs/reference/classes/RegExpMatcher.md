[obscenity](../README.md) / RegExpMatcher

# Class: RegExpMatcher

An implementation of the [[Matcher]] interface using regular expressions and
string searching methods.

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

• **new RegExpMatcher**(`options`)

Creates a new [[RegExpMatcher]] with the options given.

**`Example`**

```typescript
// Use the options provided by the English preset.
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

**`Example`**

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

**`Example`**

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

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`RegExpMatcherOptions`](../interfaces/RegExpMatcherOptions.md) | Options to use. |

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:74](https://github.com/jo3-l/obscenity/blob/37976b6/src/matcher/regexp/RegExpMatcher.ts#L74)

## Methods

### getAllMatches

▸ **getAllMatches**(`input`, `sorted?`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Returns all matches of blacklisted terms in the text.

If you only need to check for the presence of a match, and do not need
more specific information about the matches, use the `hasMatch()` method,
which is typically more efficient.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `input` | `string` | `undefined` | Text to find profanities in. |
| `sorted` | `boolean` | `false` | Whether the resulting list of matches should be sorted using [[compareMatchByPositionAndId]]. Defaults to `false`. |

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

A list of matches of the matcher on the text. The matches are
guaranteed to be sorted if and only if the `sorted` parameter is `true`,
otherwise, their order is unspecified.

#### Implementation of

[Matcher](../interfaces/Matcher.md).[getAllMatches](../interfaces/Matcher.md#getallmatches)

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:86](https://github.com/jo3-l/obscenity/blob/37976b6/src/matcher/regexp/RegExpMatcher.ts#L86)

___

### hasMatch

▸ **hasMatch**(`input`): `boolean`

Checks whether there is a match for any blacklisted term in the text.

This is typically more efficient than calling `getAllMatches` and
checking the result, though it depends on the implementation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | Text to check. |

#### Returns

`boolean`

#### Implementation of

[Matcher](../interfaces/Matcher.md).[hasMatch](../interfaces/Matcher.md#hasmatch)

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:116](https://github.com/jo3-l/obscenity/blob/37976b6/src/matcher/regexp/RegExpMatcher.ts#L116)
