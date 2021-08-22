[obscenity](../README.md) / PatternMatcherOptions

# Interface: PatternMatcherOptions

Options for the [PatternMatcher](../classes/PatternMatcher.md).

## Table of contents

### Properties

- [blacklistMatcherTransformers](PatternMatcherOptions.md#blacklistmatchertransformers)
- [blacklistedPatterns](PatternMatcherOptions.md#blacklistedpatterns)
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

[src/matcher/PatternMatcher.ts:526](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L526)

___

### blacklistedPatterns

• **blacklistedPatterns**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms to match on.

**User-supplied patterns**

Allowing user-supplied patterns is potentially dangerous and frowned
upon, but should in theory be safe if the number of optional nodes that
are permitted in patterns is limited to prevent pattern expansion from
resulting in an unacceptable number of variants.

#### Defined in

[src/matcher/PatternMatcher.ts:502](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L502)

___

### whitelistMatcherTransformers

• `Optional` **whitelistMatcherTransformers**: `TransformerContainer`[]

A set of transformers that should be applied to the input text before
whitelisted terms are matched. This does not affect the matching of
blacklisted terms.

Transformers will be applied in the order they appear.

**`default`** []

#### Defined in

[src/matcher/PatternMatcher.ts:537](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L537)

___

### whitelistedTerms

• `Optional` **whitelistedTerms**: `string`[]

A list of whitelisted terms. If a whitelisted term matches some part of
the text, a match of a blacklisted pattern on the same will not be
reported.

For example, if we had a pattern `penis` and a whitelisted term `pen is`,
only no matches would be reported for the input text `the pen is mightier
than the sword.`

**`default`** []

#### Defined in

[src/matcher/PatternMatcher.ts:515](https://github.com/jo3-l/obscenity/blob/4c7b1df/src/matcher/PatternMatcher.ts#L515)
