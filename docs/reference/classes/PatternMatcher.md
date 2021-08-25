[obscenity](../README.md) / PatternMatcher

# Class: PatternMatcher

Matches patterns on text, ignoring parts of the text that are matched by
whitelisted terms.

## Table of contents

### Constructors

- [constructor](PatternMatcher.md#constructor)

### Methods

- [getAllMatches](PatternMatcher.md#getallmatches)
- [hasMatch](PatternMatcher.md#hasmatch)

## Constructors

### constructor

• **new PatternMatcher**(`__namedParameters`)

Creates a new pattern matcher with the options given.

**`example`**
```typescript
// Simple matcher that only has blacklisted patterns.
const matcher = new PatternMatcher({
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
const matcher = new PatternMatcher({
	blacklistedTerms: [
		{ id: 1, pattern: pattern`penis` },
		{ id: 2, pattern: pattern`fuck` },
	],
	whitelistedTerms: ['pen is'],
	blacklistMatcherTransformers: [
		resolveConfusablesTransformer(), // '🅰' => 'a'
		resolveLeetSpeakTransformer(), // '$' => 's'
		foldAsciiCharCaseTransformer(), // case insensitive matching
		collapseDuplicatesTransformer(), // 'aaaa' => 'a'
		skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
	],
});

// Output all matches.
console.log(matcher.getAllMatches('fu.....uuuuCK the pen is mightier than the sword!'));
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`PatternMatcherOptions`](../interfaces/PatternMatcherOptions.md) |

#### Defined in

[src/matcher/PatternMatcher.ts:123](https://github.com/jo3-l/obscenity/blob/0f3c7b6/src/matcher/PatternMatcher.ts#L123)

## Methods

### getAllMatches

▸ **getAllMatches**(`input`, `sorted?`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Returns all matches of the matcher on the text.

If you only need to check for the presence of a match, and have no use
for more specific information about the matches, use the `hasMatch()`
method, which is more efficient.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `input` | `string` | `undefined` | Text to find profanities in. |
| `sorted` | `boolean` | `false` | Whether the resulting list of matches should be sorted using [compareMatchByPositionAndId](../README.md#comparematchbypositionandid). Defaults to `false`. |

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

A list of matches of the matcher on the text. The matches are
guaranteed to be sorted if and only if the `sorted` parameter is `true`,
otherwise, their order is unspecified.

#### Defined in

[src/matcher/PatternMatcher.ts:164](https://github.com/jo3-l/obscenity/blob/0f3c7b6/src/matcher/PatternMatcher.ts#L164)

___

### hasMatch

▸ **hasMatch**(`input`): `boolean`

Checks whether the matcher matches on the text.

This is more efficient than calling `getAllMatches` and checking the result,
as it stops once it finds a match.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | Text to check. |

#### Returns

`boolean`

#### Defined in

[src/matcher/PatternMatcher.ts:179](https://github.com/jo3-l/obscenity/blob/0f3c7b6/src/matcher/PatternMatcher.ts#L179)
