[obscenity](../README.md) / Matcher

# Interface: Matcher

Searches for blacklisted terms in text, ignoring parts matched by whitelisted
terms.

See:
- [[RegExpMatcher]] for an implementation using regular expressions.

## Implemented by

- [`RegExpMatcher`](../classes/RegExpMatcher.md)

## Table of contents

### Methods

- [getAllMatches](Matcher.md#getallmatches)
- [hasMatch](Matcher.md#hasmatch)

## Methods

### getAllMatches

▸ **getAllMatches**(`input`, `sorted?`): [`MatchPayload`](MatchPayload.md)[]

Returns all matches of blacklisted terms in the text.

If you only need to check for the presence of a match, and do not need
more specific information about the matches, use the `hasMatch()` method,
which is typically more efficient.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | Text to find profanities in. |
| `sorted?` | `boolean` | Whether the resulting list of matches should be sorted using [[compareMatchByPositionAndId]]. Defaults to `false`. |

#### Returns

[`MatchPayload`](MatchPayload.md)[]

A list of matches of the matcher on the text. The matches are
guaranteed to be sorted if and only if the `sorted` parameter is `true`,
otherwise, their order is unspecified.

#### Defined in

[src/matcher/Matcher.ts:25](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/Matcher.ts#L25)

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

#### Defined in

[src/matcher/Matcher.ts:35](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/Matcher.ts#L35)
