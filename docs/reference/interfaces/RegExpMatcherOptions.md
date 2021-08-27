[obscenity](../README.md) / RegExpMatcherOptions

# Interface: RegExpMatcherOptions

Options for the [RegExpMatcher](../classes/RegExpMatcher.md).

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

**`default`** []

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:242](https://github.com/jo3-l/obscenity/blob/c0d50c3/src/matcher/regexp/RegExpMatcher.ts#L242)

___

### blacklistedTerms

• **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms.

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:218](https://github.com/jo3-l/obscenity/blob/c0d50c3/src/matcher/regexp/RegExpMatcher.ts#L218)

___

### whitelistMatcherTransformers

• `Optional` **whitelistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
whitelisted terms are matched. This does not affect the matching of
blacklisted terms.

Transformers will be applied in the order they appear.

**`default`** []

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:253](https://github.com/jo3-l/obscenity/blob/c0d50c3/src/matcher/regexp/RegExpMatcher.ts#L253)

___

### whitelistedTerms

• `Optional` **whitelistedTerms**: `string`[]

A list of whitelisted terms. If a whitelisted term matches some part of
the text, a match of a blacklisted pattern within that part of the text
will not be emitted.

For example, if we had a pattern `penis` and a whitelisted term `pen is`,
only no matches would be reported for the input text `the pen is mightier
than the sword.`

**`default`** []

#### Defined in

[src/matcher/regexp/RegExpMatcher.ts:231](https://github.com/jo3-l/obscenity/blob/c0d50c3/src/matcher/regexp/RegExpMatcher.ts#L231)
