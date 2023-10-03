[obscenity](../README.md) / RegExpMatcherOptions

# Interface: RegExpMatcherOptions

Options for the [[RegExpMatcher]].

## Table of contents

### Properties

- [blacklistMatcherTransformers](RegExpMatcherOptions.md#blacklistmatchertransformers)
- [blacklistedTerms](RegExpMatcherOptions.md#blacklistedterms)
- [whitelistMatcherTransformers](RegExpMatcherOptions.md#whitelistmatchertransformers)
- [whitelistedTerms](RegExpMatcherOptions.md#whitelistedterms)

## Properties

### blacklistMatcherTransformers

• `Optional` **blacklistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
blacklisted patterns are matched. This does not affect the matching of
whitelisted terms.

Transformers will be applied in the order they appear.

**`Default`**

```ts
[]
```

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:220](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/regexp/RegExpMatcher.ts#L220)

___

### blacklistedTerms

• **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms.

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:225](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/regexp/RegExpMatcher.ts#L225)

___

### whitelistMatcherTransformers

• `Optional` **whitelistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
whitelisted terms are matched. This does not affect the matching of
blacklisted terms.

Transformers will be applied in the order they appear.

**`Default`**

```ts
[]
```

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:236](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/regexp/RegExpMatcher.ts#L236)

___

### whitelistedTerms

• `Optional` **whitelistedTerms**: `string`[]

A list of whitelisted terms. If a whitelisted term matches some part of
the text, a match of a blacklisted pattern within that part of the text
will not be emitted.

For example, if we had a pattern `penis` and a whitelisted term `pen is`,
only no matches would be reported for the input text `the pen is mightier
than the sword.`

**`Default`**

```ts
[]
```

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:249](https://github.com/jo3-l/obscenity/blob/74dc406/src/matcher/regexp/RegExpMatcher.ts#L249)
