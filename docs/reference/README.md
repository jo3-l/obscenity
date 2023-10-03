obscenity

# obscenity

## Table of contents

### Enumerations

- [SyntaxKind](enums/SyntaxKind.md)

### Classes

- [DataSet](classes/DataSet.md)
- [ParserError](classes/ParserError.md)
- [PhraseBuilder](classes/PhraseBuilder.md)
- [RegExpMatcher](classes/RegExpMatcher.md)
- [TextCensor](classes/TextCensor.md)

### Interfaces

- [BlacklistedTerm](interfaces/BlacklistedTerm.md)
- [BoundaryAssertionNode](interfaces/BoundaryAssertionNode.md)
- [CollapseDuplicatesTransformerOptions](interfaces/CollapseDuplicatesTransformerOptions.md)
- [LiteralNode](interfaces/LiteralNode.md)
- [MatchPayload](interfaces/MatchPayload.md)
- [Matcher](interfaces/Matcher.md)
- [OptionalNode](interfaces/OptionalNode.md)
- [ParsedPattern](interfaces/ParsedPattern.md)
- [PhraseContainer](interfaces/PhraseContainer.md)
- [ProcessedCollapseDuplicatesTransformerOptions](interfaces/ProcessedCollapseDuplicatesTransformerOptions.md)
- [RegExpMatcherOptions](interfaces/RegExpMatcherOptions.md)
- [WildcardNode](interfaces/WildcardNode.md)

### Type Aliases

- [CensorContext](README.md#censorcontext)
- [CharacterMapping](README.md#charactermapping)
- [EnglishProfaneWord](README.md#englishprofaneword)
- [MatchPayloadWithPhraseMetadata](README.md#matchpayloadwithphrasemetadata)
- [Node](README.md#node)
- [TextCensorStrategy](README.md#textcensorstrategy)

### Variables

- [englishDataset](README.md#englishdataset)
- [englishRecommendedBlacklistMatcherTransformers](README.md#englishrecommendedblacklistmatchertransformers)
- [englishRecommendedTransformers](README.md#englishrecommendedtransformers)
- [englishRecommendedWhitelistMatcherTransformers](README.md#englishrecommendedwhitelistmatchertransformers)
- [version](README.md#version)

### Functions

- [assignIncrementingIds](README.md#assignincrementingids)
- [asteriskCensorStrategy](README.md#asteriskcensorstrategy)
- [collapseDuplicatesTransformer](README.md#collapseduplicatestransformer)
- [compareMatchByPositionAndId](README.md#comparematchbypositionandid)
- [fixedCharCensorStrategy](README.md#fixedcharcensorstrategy)
- [fixedPhraseCensorStrategy](README.md#fixedphrasecensorstrategy)
- [grawlixCensorStrategy](README.md#grawlixcensorstrategy)
- [keepEndCensorStrategy](README.md#keependcensorstrategy)
- [keepStartCensorStrategy](README.md#keepstartcensorstrategy)
- [parseRawPattern](README.md#parserawpattern)
- [pattern](README.md#pattern)
- [randomCharFromSetCensorStrategy](README.md#randomcharfromsetcensorstrategy)
- [remapCharactersTransformer](README.md#remapcharacterstransformer)
- [resolveConfusablesTransformer](README.md#resolveconfusablestransformer)
- [resolveLeetSpeakTransformer](README.md#resolveleetspeaktransformer)
- [skipNonAlphabeticTransformer](README.md#skipnonalphabetictransformer)
- [toAsciiLowerCaseTransformer](README.md#toasciilowercasetransformer)

## Type Aliases

### CensorContext

Ƭ **CensorContext**: [`MatchPayload`](interfaces/MatchPayload.md) & { `input`: `string` ; `overlapsAtEnd`: `boolean` ; `overlapsAtStart`: `boolean`  }

Context passed to [[TextCensorStrategy | text censoring strategies]].

#### Defined in

[src/censor/TextCensor.ts:104](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/TextCensor.ts#L104)

___

### CharacterMapping

Ƭ **CharacterMapping**: `Map`<`string`, `string`\> \| `Record`<`string`, `string`\>

Maps characters to other characters.
The key of the map/object should be the transformed character, while the value
should be a set of characters that map to the transformed character.

#### Defined in

[src/transformer/remap-characters/index.ts:60](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/remap-characters/index.ts#L60)

___

### EnglishProfaneWord

Ƭ **EnglishProfaneWord**: ``"abbo"`` \| ``"abeed"`` \| ``"africoon"`` \| ``"anal"`` \| ``"anus"`` \| ``"arabush"`` \| ``"arse"`` \| ``"ass"`` \| ``"bastard"`` \| ``"bestiality"`` \| ``"bitch"`` \| ``"blowjob"`` \| ``"boob"`` \| ``"boonga"`` \| ``"buttplug"`` \| ``"chingchong"`` \| ``"chink"`` \| ``"cock"`` \| ``"cuck"`` \| ``"cum"`` \| ``"cunt"`` \| ``"deepthroat"`` \| ``"dick"`` \| ``"dildo"`` \| ``"doggystyle"`` \| ``"double penetration"`` \| ``"ejaculate"`` \| ``"fag"`` \| ``"felch"`` \| ``"fellatio"`` \| ``"finger bang"`` \| ``"fisting"`` \| ``"fuck"`` \| ``"gangbang"`` \| ``"handjob"`` \| ``"hentai"`` \| ``"hooker"`` \| ``"incest"`` \| ``"jerk off"`` \| ``"jizz"`` \| ``"lubejob"`` \| ``"masturbate"`` \| ``"nigger"`` \| ``"orgasm"`` \| ``"orgy"`` \| ``"penis"`` \| ``"porn"`` \| ``"pussy"`` \| ``"rape"`` \| ``"retard"`` \| ``"scat"`` \| ``"semen"`` \| ``"sex"`` \| ``"slut"`` \| ``"tit"`` \| ``"tranny"`` \| ``"vagina"`` \| ``"whore"``

All the profane words that are included in the [[englishDataset | english dataset]] by default.

#### Defined in

[src/preset/english.ts:377](https://github.com/jo3-l/obscenity/blob/74dc406/src/preset/english.ts#L377)

___

### MatchPayloadWithPhraseMetadata

Ƭ **MatchPayloadWithPhraseMetadata**<`MetadataType`\>: [`MatchPayload`](interfaces/MatchPayload.md) & { `phraseMetadata?`: `MetadataType`  }

Extends the default match payload by adding phrase metadata.

#### Type parameters

| Name |
| :------ |
| `MetadataType` |

#### Defined in

[src/dataset/DataSet.ts:190](https://github.com/jo3-l/obscenity/blob/74dc406/src/dataset/DataSet.ts#L190)

___

### Node

Ƭ **Node**: [`LiteralNode`](interfaces/LiteralNode.md) \| [`OptionalNode`](interfaces/OptionalNode.md) \| [`WildcardNode`](interfaces/WildcardNode.md)

All the possible kinds of nodes.

#### Defined in

[src/pattern/Nodes.ts:24](https://github.com/jo3-l/obscenity/blob/74dc406/src/pattern/Nodes.ts#L24)

___

### TextCensorStrategy

Ƭ **TextCensorStrategy**: (`ctx`: [`CensorContext`](README.md#censorcontext)) => `string`

#### Type declaration

▸ (`ctx`): `string`

A text censoring strategy, which receives a [[CensorContext]] and returns a
replacement string.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`CensorContext`](README.md#censorcontext) |

##### Returns

`string`

#### Defined in

[src/censor/TextCensor.ts:99](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/TextCensor.ts#L99)

## Variables

### englishDataset

• `Const` **englishDataset**: [`DataSet`](classes/DataSet.md)<{ `originalWord`: [`EnglishProfaneWord`](README.md#englishprofaneword)  }\>

A dataset of profane English words.

**`Example`**

```typescript
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

**`Example`**

```typescript
// Extending the data-set by adding a new word and removing an existing one.
const myDataset = new DataSet()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'vagina')
	.addPhrase((phrase) => phrase.addPattern(pattern`|balls|`));
```

**`Copyright`**

The words are taken from the [cuss](https://github.com/words/cuss) project,
with some modifications.

```text
(The MIT License)

Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

#### Defined in

[src/preset/english.ts:103](https://github.com/jo3-l/obscenity/blob/74dc406/src/preset/english.ts#L103)

___

### englishRecommendedBlacklistMatcherTransformers

• `Const` **englishRecommendedBlacklistMatcherTransformers**: (`SimpleTransformerContainer` \| `StatefulTransformerContainer`)[]

A set of transformers to be used when matching blacklisted patterns with the
[[englishDataset | english word dataset]].

#### Defined in

[src/preset/english.ts:14](https://github.com/jo3-l/obscenity/blob/74dc406/src/preset/english.ts#L14)

___

### englishRecommendedTransformers

• `Const` **englishRecommendedTransformers**: `Pick`<[`RegExpMatcherOptions`](interfaces/RegExpMatcherOptions.md), ``"blacklistMatcherTransformers"`` \| ``"whitelistMatcherTransformers"``\>

Recommended transformers to be used with the [[englishDataset | english word
dataset]] and the [[RegExpMatcher]].

#### Defined in

[src/preset/english.ts:48](https://github.com/jo3-l/obscenity/blob/74dc406/src/preset/english.ts#L48)

___

### englishRecommendedWhitelistMatcherTransformers

• `Const` **englishRecommendedWhitelistMatcherTransformers**: (`SimpleTransformerContainer` \| `StatefulTransformerContainer`)[]

A set of transformers to be used when matching whitelisted terms with the
[[englishDataset | english word dataset]].

#### Defined in

[src/preset/english.ts:36](https://github.com/jo3-l/obscenity/blob/74dc406/src/preset/english.ts#L36)

___

### version

• `Const` **version**: ``"0.1.0"``

The current version of the library, formatted as `MAJOR.MINOR.PATCH`.

#### Defined in

[src/index.ts:27](https://github.com/jo3-l/obscenity/blob/74dc406/src/index.ts#L27)

## Functions

### assignIncrementingIds

▸ **assignIncrementingIds**(`patterns`): [`BlacklistedTerm`](interfaces/BlacklistedTerm.md)[]

Assigns incrementing IDs to the patterns provided, starting with 0. It is
useful if you have a list of patterns to match against but don't care about
identifying which pattern matched.

**`Example`**

```typescript
const matcher = new RegExpMatcher({
 ...,
 blacklistedTerms: assignIncrementingIds([
     pattern`f?uck`,
     pattern`|shit|`,
 ]),
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `patterns` | [`ParsedPattern`](interfaces/ParsedPattern.md)[] | List of parsed patterns. |

#### Returns

[`BlacklistedTerm`](interfaces/BlacklistedTerm.md)[]

A list of blacklisted terms with valid IDs which can then be passed
to the [[RegExpMatcher]].

#### Defined in

[src/matcher/BlacklistedTerm.ts:37](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/BlacklistedTerm.ts#L37)

___

### asteriskCensorStrategy

▸ **asteriskCensorStrategy**(): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that generates strings made up of asterisks (`*`).

**`Example`**

```typescript
const strategy = asteriskCensorStrategy();
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '**** you'
```

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:71](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L71)

___

### collapseDuplicatesTransformer

▸ **collapseDuplicatesTransformer**(`options?`): `StatefulTransformerContainer`

Creates a transformer that collapses duplicate characters. This is useful for
detecting variants of patterns in which a character is repeated to bypass
detection.

As an example, the pattern `hi` does not match `hhiii` by default, as the
frequency of the characters does not match. With this transformer, `hhiii`
would become `hi`, and would therefore match the pattern.

**Application order**

It is recommended that this transformer be applied after all other
transformers. Using it before other transformers may have the effect of not
catching duplicates of certain characters that were originally different but
became the same after a series of transformations.

**Warning**

This transformer should be used with caution, as while it can make certain
patterns match text that wouldn't have been matched before, it can also go
the other way. For example, the pattern `hello` clearly matches `hello`, but
with this transformer, by default, `hello` would become `helo` which does
_not_ match. In this cases, the `customThresholds` option can be used to
allow two `l`s in a row, making it leave `hello` unchanged.

**`Example`**

```typescript
// Collapse runs of the same character.
const transformer = collapseDuplicatesTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

**`Example`**

```typescript
// Collapse runs of characters other than 'a'.
const transformer = collapseDuplicatesTransformer({ customThresholds: new Map([['a', Infinity]]) });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CollapseDuplicatesTransformerOptions`](interfaces/CollapseDuplicatesTransformerOptions.md) | Options for the transformer. |

#### Returns

`StatefulTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/collapse-duplicates/index.ts:46](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/collapse-duplicates/index.ts#L46)

___

### compareMatchByPositionAndId

▸ **compareMatchByPositionAndId**(`a`, `b`): ``0`` \| ``1`` \| ``-1``

Compares two match payloads.

If the first match payload's start index is less than the second's, `-1` is
  returned;
If the second match payload's start index is less than the first's, `1` is
  returned;
If the first match payload's end index is less than the second's, `-1` is
  returned;
If the second match payload's end index is less than the first's, `1` is
  returned;
If the first match payload's term ID is less than the second's, `-1` is
  returned;
If the first match payload's term ID is equal to the second's, `0` is
  returned;
Otherwise, `1` is returned.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | [`MatchPayload`](interfaces/MatchPayload.md) | First match payload. |
| `b` | [`MatchPayload`](interfaces/MatchPayload.md) | Second match payload. |

#### Returns

``0`` \| ``1`` \| ``-1``

The result of the comparison: -1 if the first should sort lower than
the second, 0 if they are the same, and 1 if the second should sort lower
than the first.

#### Defined in

[src/matcher/MatchPayload.ts:57](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/MatchPayload.ts#L57)

___

### fixedCharCensorStrategy

▸ **fixedCharCensorStrategy**(`char`): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that generates replacement strings that are made up
of the character given, repeated as many times as needed.

**`Example`**

```typescript
const strategy = fixedCharCensorStrategy('*');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '**** you'.
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `char` | `string` | String that represents the code point which should be used when generating the replacement string. Must be exactly one code point in length. |

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:134](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L134)

___

### fixedPhraseCensorStrategy

▸ **fixedPhraseCensorStrategy**(`phrase`): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that returns a fixed string.

**`Example`**

```typescript
// The replacement phrase '' effectively removes all matched regions
// from the string.
const strategy = fixedPhraseCensorStrategy('');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: ' you'
```

**`Example`**

```typescript
const strategy = fixedPhraseCensorStrategy('fudge');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'fudge you'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `phrase` | `string` | Replacement phrase to use. |

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:115](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L115)

___

### grawlixCensorStrategy

▸ **grawlixCensorStrategy**(): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that generates
[grawlix](https://www.merriam-webster.com/words-at-play/grawlix-symbols-swearing-comic-strips),
i.e. strings that contain the characters `%`, `@`, `$`, `&`, and `*`.

**`Example`**

```typescript
const strategy = grawlixCensorStrategy();
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '%@&* you'
```

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:89](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L89)

___

### keepEndCensorStrategy

▸ **keepEndCensorStrategy**(`baseStrategy`): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that extends another strategy, adding the last
character matched at the end of the generated string.

**`Example`**

```typescript
const strategy = keepEndCensorStrategy(asteriskCensorStrategy());
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: '***k you'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseStrategy` | [`TextCensorStrategy`](README.md#textcensorstrategy) | Strategy to extend. It will be used to produce the start of the generated string. |

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:51](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L51)

___

### keepStartCensorStrategy

▸ **keepStartCensorStrategy**(`baseStrategy`): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that extends another strategy, adding the first
character matched at the start of the generated string.

**`Example`**

```typescript
const strategy = keepStartCensorStrategy(grawlixCensorStrategy());
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'f$@* you'
```

**`Example`**

```typescript
// Since keepEndCensorStrategy() returns another text censoring strategy, you can use it
// as the base strategy to pass to keepStartCensorStrategy().
const strategy = keepStartCensorStrategy(keepEndCensorStrategy(asteriskCensorStrategy()));
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you'
// After: 'f**k you'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseStrategy` | [`TextCensorStrategy`](README.md#textcensorstrategy) | Strategy to extend. It will be used to produce the end of the generated string. |

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:28](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L28)

___

### parseRawPattern

▸ **parseRawPattern**(`pattern`): [`ParsedPattern`](interfaces/ParsedPattern.md)

Parses a string as a pattern directly.

**Note**

It is recommended to use the [[pattern | pattern template tag]] instead of
this function for literal patterns (i.e. ones without dynamic content).

**`Throws`**

[[ParserError]] if a syntactical error was detected while parsing the
pattern.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pattern` | `string` | The string to parse. |

#### Returns

[`ParsedPattern`](interfaces/ParsedPattern.md)

The parsed pattern, which can then be used with the
[[RegExpMatcher]].

#### Defined in

[src/pattern/Pattern.ts:130](https://github.com/jo3-l/obscenity/blob/74dc406/src/pattern/Pattern.ts#L130)

___

### pattern

▸ **pattern**(`strings`, `...expressions`): [`ParsedPattern`](interfaces/ParsedPattern.md)

Parses a pattern, which matches a set of strings; see the `Syntax` section
for details. This function is intended to be called as a [template
tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

**Syntax**

Generally speaking, in patterns, characters are interpreted literally. That
is, they match exactly what they are: `a` matches an `a`, `b` matches a `b`,
`;` matches a `;`, and so on.

However, there are several constructs that have special meaning:

- `[expr]` matches either the empty string or `expr` (an **optional
  expression**). `expr` may be a sequence of literal characters or a wildcard
  (see below).
- `?` matches any character (a **wildcard**).
- A `|` at the start or end of the pattern asserts position at a word
  boundary (a **word boundary assertion**). If `|` is at the start, it
  ensures that the match either starts at the start of the string or a non-
  word character preceding it; if it is at the end, it ensures that the match
  either ends at the end of the string or a non-word character follows it.

  A word character is an lower-case or upper-case ASCII alphabet character or
  an ASCII digit.
- In a literal, a backslash may be used to **escape** one of the
  meta-characters mentioned above so that it does match literally: `\\[`
  matches `[`, and does not mark the start of an optional expression.

  **Note about escapes**

  As this function operates on raw strings, double-escaping backslashes is
  not necessary:

  ```typescript
  // Use this:
  const parsed = pattern`hello \[`;
  // Don't use this:
  const parsed = pattern`hello \\[`;
  ```

**Examples**

- `baz` matches `baz` exactly.

- `b\[ar` matches `b[ar` exactly.

- `d?ude` matches `d`, then any character, then `ude`. All of the following
  strings are matched by this pattern:
  - `dyude`
  - `d;ude`
  - `d!ude`

- `h[?]ello` matches either `h`, any character, then `ello` or the literal
  string `hello`. The set of strings it matches is equal to the union of the
  set of strings that the two patterns `hello` and `h?ello` match. All of the
  following strings are matched by this pattern:
  - `hello`
  - `h!ello`
  - `h;ello`

- `|foobar|` asserts position at a word boundary, matches the literal string
  `foobar`, and asserts position at a word boundary:
  - `foobar` matches, as the start and end of string count as word
    boundaries;
  - `yofoobar` does _not_ match, as `f` is immediately preceded by a word
    character;
  - `hello foobar bye` matches, as `f` is immediately preceded by a non-word
    character, and `r` is immediately followed by a non-word character.

**Grammar**

```
Pattern  ::= '['? Atom* ']'?
Atom     ::= Literal | Wildcard | Optional
Optional ::= '[' Literal | Wildcard ']'
Literal  ::= (NON_SPECIAL | '\' SUPPORTS_ESCAPING)+

NON_SPECIAL       ::= _any character other than '\', '?', '[', ']', or '|'_
SUPPORTS_ESCAPING ::= '\' | '[' | ']' | '?' | '|'
```

**`Example`**

```typescript
const parsed = pattern`hello?`; // match "hello", then any character
```

**`Example`**

```typescript
const parsed = pattern`w[o]rld`; // match "wrld" or "world"
```

**`Example`**

```typescript
const parsed = pattern`my initials are \[??\]`; // match "my initials are [", then any two characters, then a "]"
```

**`Throws`**

[[ParserError]] if a syntactical error was detected while parsing the
pattern.

**`See`**

[[parseRawPattern]] if you want to parse a string into a pattern without
using a template tag.

#### Parameters

| Name | Type |
| :------ | :------ |
| `strings` | `TemplateStringsArray` |
| `...expressions` | `unknown`[] |

#### Returns

[`ParsedPattern`](interfaces/ParsedPattern.md)

The parsed pattern, which can then be used with the
[[RegExpMatcher]].

#### Defined in

[src/pattern/Pattern.ts:106](https://github.com/jo3-l/obscenity/blob/74dc406/src/pattern/Pattern.ts#L106)

___

### randomCharFromSetCensorStrategy

▸ **randomCharFromSetCensorStrategy**(`charset`): [`TextCensorStrategy`](README.md#textcensorstrategy)

A text censoring strategy that generates replacement strings made up of
random characters from the set of characters provided.

**`Example`**

```typescript
const strategy = randomCharFromSetCensorStrategy('$#!');
const censor = new TextCensor().setStrategy(strategy);
// Before: 'fuck you!'
// After: '!##$ you!'
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `charset` | `string` | Set of characters from which the replacement string should be constructed. Must not be empty. |

#### Returns

[`TextCensorStrategy`](README.md#textcensorstrategy)

A [[TextCensorStrategy]] for use with the [[TextCensor]].

#### Defined in

[src/censor/BuiltinStrategies.ts:155](https://github.com/jo3-l/obscenity/blob/74dc406/src/censor/BuiltinStrategies.ts#L155)

___

### remapCharactersTransformer

▸ **remapCharactersTransformer**(`mapping`): `SimpleTransformerContainer`

Maps certain characters to other characters, leaving other characters
unchanged.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain.

**`Example`**

```typescript
// Transform 'a' to 'b'.
const transformer = remapCharactersTransformer({ 'b': 'a' });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

**`Example`**

```typescript
// Transform '🅱️' to 'b', and use a map instead of an object as the argument.
const transformer = remapCharactersTransformer(new Map([['b', '🅱️']]));
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

**`Example`**

```typescript
// Transform '🇴' and '0' to 'o'.
const transformer = remapCharactersTransformer({ o: '🇴0' });
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

**`See`**

 - [[resolveConfusablesTransformer|  Transformer that handles confusable Unicode characters]]
 - [[resolveLeetSpeakTransformer | Transformer that handles leet-speak]]

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mapping` | [`CharacterMapping`](README.md#charactermapping) | A map/object mapping certain characters to others. |

#### Returns

`SimpleTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/remap-characters/index.ts:38](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/remap-characters/index.ts#L38)

___

### resolveConfusablesTransformer

▸ **resolveConfusablesTransformer**(): `SimpleTransformerContainer`

Creates a transformer that maps confusable Unicode characters to their
normalized equivalent. For example, `⓵`, `➊`, and `⑴` become `1` when using
this transformer.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain.

**`Example`**

```typescript
const transformer = resolveConfusablesTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

#### Returns

`SimpleTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/resolve-confusables/index.ts:22](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/resolve-confusables/index.ts#L22)

___

### resolveLeetSpeakTransformer

▸ **resolveLeetSpeakTransformer**(): `SimpleTransformerContainer`

Creates a transformer that maps leet-speak characters to their normalized
equivalent. For example, `$` becomes `s` when using this transformer.

**Application order**

It is recommended that this transformer be applied near the start of the
transformer chain, but after similar transformers that map characters to
other characters, such as the [[resolveConfusablesTransformer | transformer
that resolves confusable Unicode characters]].

**`Example`**

```typescript
const transformer = resolveLeetSpeakTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

#### Returns

`SimpleTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/resolve-leetspeak/index.ts:23](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/resolve-leetspeak/index.ts#L23)

___

### skipNonAlphabeticTransformer

▸ **skipNonAlphabeticTransformer**(): `SimpleTransformerContainer`

Creates a transformer that skips non-alphabetic characters (`a`-`z`,
`A`-`Z`). This is useful when matching text on patterns that are solely
comprised of alphabetic characters (the pattern `hello` does not match
`h.e.l.l.o` by default, but does with this transformer).

**Application order**

It is recommended that this transformer be applied near the end of the
transformer chain.

**`Example`**

```typescript
const transformer = skipNonAlphabeticTransformer();
const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
```

#### Returns

`SimpleTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/skip-non-alphabetic/index.ts:23](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/skip-non-alphabetic/index.ts#L23)

___

### toAsciiLowerCaseTransformer

▸ **toAsciiLowerCaseTransformer**(): `SimpleTransformerContainer`

Creates a transformer that changes all ASCII alphabet characters to
lower-case, leaving other characters unchanged.

**Application order**

It is recommended that this transformer be applied near the end of the
transformer chain. Using it before other transformers may have the effect of
making its changes useless as transformers applied after produce characters
of varying cases.

#### Returns

`SimpleTransformerContainer`

A container holding the transformer, which can then be passed to the
[[RegExpMatcher]].

#### Defined in

[src/transformer/to-ascii-lowercase/index.ts:18](https://github.com/jo3-l/obscenity/blob/74dc406/src/transformer/to-ascii-lowercase/index.ts#L18)
