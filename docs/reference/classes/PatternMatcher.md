[obscenity](../README.md) / PatternMatcher

# Class: PatternMatcher

Matches patterns on text, ignoring parts of the text that are matched by
whitelisted terms.

## Table of contents

### Constructors

- [constructor](PatternMatcher.md#constructor)

### Accessors

- [input](PatternMatcher.md#input)

### Methods

- [getAllMatches](PatternMatcher.md#getallmatches)
- [hasMatch](PatternMatcher.md#hasmatch)
- [setInput](PatternMatcher.md#setinput)

## Constructors

### constructor

• **new PatternMatcher**(`__namedParameters`)

Creates a new pattern matcher with the options given.

**`example`**
```typescript
// Simple matcher that only has blacklisted patterns.
const matcher = new PatternMatcher({
	blacklistedPatterns: assignIncrementingIds([
		pattern`fuck`,
		pattern`f?uck`, // wildcards (?)
		pattern`bitch`,
		pattern`b[i]tch` // optionals ([i] matches either "i" or "")
	]),
});

// Check whether some string matches any of the patterns.
const doesMatch = matcher.setInput('fuck you bitch').hasMatch();
```

**`example`**
```typescript
// A more advanced example, with transformers and whitelisted terms.
const matcher = new PatternMatcher({
	blacklistedPatterns: [
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
console.log(matcher
	.setInput('fu.....uuuuCK the pen is mightier than the sword!')
	.getAllMatches());
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`PatternMatcherOptions`](../interfaces/PatternMatcherOptions.md) |

#### Defined in

[src/matcher/PatternMatcher.ts:91](https://github.com/jo3-l/obscenity/blob/ce020a0/src/matcher/PatternMatcher.ts#L91)

## Accessors

### input

• `get` **input**(): `string`

The input that is currently being matched on.

#### Returns

`string`

#### Defined in

[src/matcher/PatternMatcher.ts:159](https://github.com/jo3-l/obscenity/blob/ce020a0/src/matcher/PatternMatcher.ts#L159)

## Methods

### getAllMatches

▸ **getAllMatches**(`sorted?`): [`MatchPayload`](../interfaces/MatchPayload.md)[]

Returns all matches of the matcher on the text.

If you only need to check for the presence of a match, and have no use
for more specific information about the matches, use the `hasMatch()`
method, which is more efficient.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `sorted` | `boolean` | `false` | Whether the resulting list of matches should be sorted using [compareMatchByPositionAndId](../README.md#comparematchbypositionandid). Defaults to `false`. |

#### Returns

[`MatchPayload`](../interfaces/MatchPayload.md)[]

A list of matches of the matcher on the text. The matches are
guaranteed to be sorted if and only if the `sorted` parameter is `true`,
otherwise, their order is unspecified.

#### Defined in

[src/matcher/PatternMatcher.ts:136](https://github.com/jo3-l/obscenity/blob/ce020a0/src/matcher/PatternMatcher.ts#L136)

___

### hasMatch

▸ **hasMatch**(): `boolean`

Checks whether the matcher matches on the text.

This is more efficient than calling `getAllMatches` and checking the result,
as it stops once it finds a match.

#### Returns

`boolean`

#### Defined in

[src/matcher/PatternMatcher.ts:150](https://github.com/jo3-l/obscenity/blob/ce020a0/src/matcher/PatternMatcher.ts#L150)

___

### setInput

▸ **setInput**(`input`): [`PatternMatcher`](PatternMatcher.md)

Sets the input of the pattern matcher.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | Input string to match against. |

#### Returns

[`PatternMatcher`](PatternMatcher.md)

#### Defined in

[src/matcher/PatternMatcher.ts:115](https://github.com/jo3-l/obscenity/blob/ce020a0/src/matcher/PatternMatcher.ts#L115)
