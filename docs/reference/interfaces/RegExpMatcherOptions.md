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

[src/matcher/regexp/RegExpMatcher.ts:229](https://github.com/jo3-l/obscenity/blob/da754da/src/matcher/regexp/RegExpMatcher.ts#L229)

___

### blacklistedTerms

• **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms.

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:234](https://github.com/jo3-l/obscenity/blob/da754da/src/matcher/regexp/RegExpMatcher.ts#L234)

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

[src/matcher/regexp/RegExpMatcher.ts:245](https://github.com/jo3-l/obscenity/blob/da754da/src/matcher/regexp/RegExpMatcher.ts#L245)

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

[src/matcher/regexp/RegExpMatcher.ts:258](https://github.com/jo3-l/obscenity/blob/da754da/src/matcher/regexp/RegExpMatcher.ts#L258)
