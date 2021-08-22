[obscenity](../README.md) / PatternMatcher

# Class: PatternMatcher

Matches patterns on text, ignoring parts of the text that are matched by
whitelisted terms.

## Table of contents

### Constructors

- [constructor](PatternMatcher.md#constructor)

### Properties

- [currentId](PatternMatcher.md#currentid)
- [currentNode](PatternMatcher.md#currentnode)
- [iter](PatternMatcher.md#iter)
- [matchLengths](PatternMatcher.md#matchlengths)
- [maxMatchLength](PatternMatcher.md#maxmatchlength)
- [output](PatternMatcher.md#output)
- [partialMatchStepCounts](PatternMatcher.md#partialmatchstepcounts)
- [partialMatches](PatternMatcher.md#partialmatches)
- [patternIdMap](PatternMatcher.md#patternidmap)
- [pendingPartialMatches](PatternMatcher.md#pendingpartialmatches)
- [rootNode](PatternMatcher.md#rootnode)
- [transformers](PatternMatcher.md#transformers)
- [usedIndices](PatternMatcher.md#usedindices)
- [whitelistedSpans](PatternMatcher.md#whitelistedspans)
- [whitelistedTermMatcher](PatternMatcher.md#whitelistedtermmatcher)
- [wildcardOnlyPatternMatchLengths](PatternMatcher.md#wildcardonlypatternmatchlengths)
- [wildcardOnlyPatterns](PatternMatcher.md#wildcardonlypatterns)

### Accessors

- [input](PatternMatcher.md#input)
- [position](PatternMatcher.md#position)

### Methods

- [buildTrie](PatternMatcher.md#buildtrie)
- [constructLinks](PatternMatcher.md#constructlinks)
- [emitMatch](PatternMatcher.md#emitmatch)
- [emitPartialMatch](PatternMatcher.md#emitpartialmatch)
- [ensureNoDuplicates](PatternMatcher.md#ensurenoduplicates)
- [extendTrie](PatternMatcher.md#extendtrie)
- [getAllMatches](PatternMatcher.md#getallmatches)
- [hasMatch](PatternMatcher.md#hasmatch)
- [registerPatternWithOnlyLiterals](PatternMatcher.md#registerpatternwithonlyliterals)
- [registerPatternWithOnlyWildcards](PatternMatcher.md#registerpatternwithonlywildcards)
- [registerPatternWithWildcardsAndLiterals](PatternMatcher.md#registerpatternwithwildcardsandliterals)
- [registerTerm](PatternMatcher.md#registerterm)
- [reset](PatternMatcher.md#reset)
- [run](PatternMatcher.md#run)
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

[src/matcher/PatternMatcher.ts:91](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L91)

## Properties

### currentId

• `Private` **currentId**: `number` = `0`

#### Defined in

[src/matcher/PatternMatcher.ts:33](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L33)

___

### currentNode

• `Private` **currentNode**: `BlacklistTrieNode`

#### Defined in

[src/matcher/PatternMatcher.ts:43](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L43)

___

### iter

• `Private` `Readonly` **iter**: `CharacterIterator`

#### Defined in

[src/matcher/PatternMatcher.ts:38](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L38)

___

### matchLengths

• `Private` `Readonly` **matchLengths**: `Map`<`number`, `number`\>

#### Defined in

[src/matcher/PatternMatcher.ts:28](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L28)

___

### maxMatchLength

• `Private` **maxMatchLength**: `number` = `0`

#### Defined in

[src/matcher/PatternMatcher.ts:32](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L32)

___

### output

• `Private` **output**: [`MatchPayload`](../interfaces/MatchPayload.md)[] = `[]`

#### Defined in

[src/matcher/PatternMatcher.ts:40](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L40)

___

### partialMatchStepCounts

• `Private` `Readonly` **partialMatchStepCounts**: `Map`<`number`, `number`\>

#### Defined in

[src/matcher/PatternMatcher.ts:29](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L29)

___

### partialMatches

• `Private` `Readonly` **partialMatches**: `CircularBuffer`<`undefined` \| `Set`<`string`\>\>

#### Defined in

[src/matcher/PatternMatcher.ts:42](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L42)

___

### patternIdMap

• `Private` `Readonly` **patternIdMap**: `Map`<`number`, `number`\>

#### Defined in

[src/matcher/PatternMatcher.ts:27](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L27)

___

### pendingPartialMatches

• `Private` `Readonly` **pendingPartialMatches**: `PendingPartialMatch`[] = `[]`

#### Defined in

[src/matcher/PatternMatcher.ts:41](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L41)

___

### rootNode

• `Private` `Readonly` **rootNode**: `BlacklistTrieNode`

#### Defined in

[src/matcher/PatternMatcher.ts:26](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L26)

___

### transformers

• `Private` `Readonly` **transformers**: `TransformerSet`

#### Defined in

[src/matcher/PatternMatcher.ts:36](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L36)

___

### usedIndices

• `Private` `Readonly` **usedIndices**: `CircularBuffer`<`number`\>

#### Defined in

[src/matcher/PatternMatcher.ts:39](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L39)

___

### whitelistedSpans

• `Private` **whitelistedSpans**: `IntervalCollection`

#### Defined in

[src/matcher/PatternMatcher.ts:44](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L44)

___

### whitelistedTermMatcher

• `Private` `Readonly` **whitelistedTermMatcher**: `WhitelistedTermMatcher`

#### Defined in

[src/matcher/PatternMatcher.ts:35](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L35)

___

### wildcardOnlyPatternMatchLengths

• `Private` `Readonly` **wildcardOnlyPatternMatchLengths**: `number`[] = `[]`

#### Defined in

[src/matcher/PatternMatcher.ts:31](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L31)

___

### wildcardOnlyPatterns

• `Private` `Readonly` **wildcardOnlyPatterns**: `Map`<`number`, `WildcardOnlyPatternData`\>

#### Defined in

[src/matcher/PatternMatcher.ts:30](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L30)

## Accessors

### input

• `get` **input**(): `string`

The input that is currently being matched on.

#### Returns

`string`

#### Defined in

[src/matcher/PatternMatcher.ts:159](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L159)

___

### position

• `Private` `get` **position**(): `number`

#### Returns

`number`

#### Defined in

[src/matcher/PatternMatcher.ts:256](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L256)

## Methods

### buildTrie

▸ `Private` **buildTrie**(`patterns`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `patterns` | [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md)[] |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:321](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L321)

___

### constructLinks

▸ `Private` **constructLinks**(): `void`

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:457](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L457)

___

### emitMatch

▸ `Private` **emitMatch**(`id`, `flags`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `flags` | `number` |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:292](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L292)

___

### emitPartialMatch

▸ `Private` **emitPartialMatch**(`data`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `PartialMatchData` |

#### Returns

`boolean`

#### Defined in

[src/matcher/PatternMatcher.ts:260](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L260)

___

### ensureNoDuplicates

▸ `Private` **ensureNoDuplicates**(`ids`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `number`[] |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:313](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L313)

___

### extendTrie

▸ `Private` **extendTrie**(`chars`): `BlacklistTrieNode`

#### Parameters

| Name | Type |
| :------ | :------ |
| `chars` | `number`[] |

#### Returns

`BlacklistTrieNode`

#### Defined in

[src/matcher/PatternMatcher.ts:441](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L441)

___

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

[src/matcher/PatternMatcher.ts:136](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L136)

___

### hasMatch

▸ **hasMatch**(): `boolean`

Checks whether the matcher matches on the text.

This is more efficient than calling `getAllMatches` and checking the result,
as it stops once it finds a match.

#### Returns

`boolean`

#### Defined in

[src/matcher/PatternMatcher.ts:150](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L150)

___

### registerPatternWithOnlyLiterals

▸ `Private` **registerPatternWithOnlyLiterals**(`id`, `pattern`, `term`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pattern` | [`LiteralNode`](../interfaces/LiteralNode.md)[] |
| `term` | [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md) |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:351](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L351)

___

### registerPatternWithOnlyWildcards

▸ `Private` **registerPatternWithOnlyWildcards**(`id`, `pattern`, `term`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pattern` | `SimpleNode`[] |
| `term` | [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md) |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:363](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L363)

___

### registerPatternWithWildcardsAndLiterals

▸ `Private` **registerPatternWithWildcardsAndLiterals**(`id`, `pattern`, `term`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |
| `pattern` | `SimpleNode`[] |
| `term` | [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md) |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:378](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L378)

___

### registerTerm

▸ `Private` **registerTerm**(`term`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `term` | [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md) |

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:325](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L325)

___

### reset

▸ `Private` **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/matcher/PatternMatcher.ts:163](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L163)

___

### run

▸ `Private` **run**(`breakAfterFirstMatch?`): `boolean`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `breakAfterFirstMatch` | `boolean` | `false` |

#### Returns

`boolean`

#### Defined in

[src/matcher/PatternMatcher.ts:171](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L171)

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

[src/matcher/PatternMatcher.ts:115](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L115)
