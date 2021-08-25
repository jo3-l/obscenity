[obscenity](../README.md) / PatternMatcherOptions

# Interface: PatternMatcherOptions

Options for the [PatternMatcher](../classes/PatternMatcher.md).

## Table of contents

### Properties

- [blacklistMatcherTransformers](PatternMatcherOptions.md#blacklistmatchertransformers)
- [blacklistedTerms](PatternMatcherOptions.md#blacklistedterms)
- [whitelistMatcherTransformers](PatternMatcherOptions.md#whitelistmatchertransformers)
- [whitelistedTerms](PatternMatcherOptions.md#whitelistedterms)

## Properties

### blacklistMatcherTransformers

• `Optional` **blacklistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
blacklisted patterns are matched. This does not affect the matching of
whitelisted terms.

Transformers will be applied in the order they appear.

**`default`** []

#### Defined in

[src/matcher/PatternMatcher.ts:510](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/matcher/PatternMatcher.ts#L510)

___

### blacklistedTerms

• **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms.

**User-supplied patterns**

Allowing user-supplied patterns is potentially dangerous and frowned
upon, but should in theory be safe if the number of optional nodes that
are permitted in patterns is limited to prevent pattern expansion from
resulting in an unacceptable number of variants.

#### Defined in

[src/matcher/PatternMatcher.ts:486](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/matcher/PatternMatcher.ts#L486)

___

### whitelistMatcherTransformers

• `Optional` **whitelistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
whitelisted terms are matched. This does not affect the matching of
blacklisted terms.

Transformers will be applied in the order they appear.

**`default`** []

#### Defined in

[src/matcher/PatternMatcher.ts:521](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/matcher/PatternMatcher.ts#L521)

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

[src/matcher/PatternMatcher.ts:499](https://github.com/jo3-l/obscenity/blob/9a1d13b/src/matcher/PatternMatcher.ts#L499)
