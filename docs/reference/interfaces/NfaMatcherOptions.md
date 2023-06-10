[obscenity](../README.md) / NfaMatcherOptions

# Interface: NfaMatcherOptions

Options for the [[NfaMatcher]].

## Table of contents

### Properties

- [blacklistMatcherTransformers](NfaMatcherOptions.md#blacklistmatchertransformers)
- [blacklistedTerms](NfaMatcherOptions.md#blacklistedterms)
- [whitelistMatcherTransformers](NfaMatcherOptions.md#whitelistmatchertransformers)
- [whitelistedTerms](NfaMatcherOptions.md#whitelistedterms)

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

[src/matcher/nfa/NfaMatcher.ts:622](https://github.com/jo3-l/obscenity/blob/563159b/src/matcher/nfa/NfaMatcher.ts#L622)

___

### blacklistedTerms

• **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

A list of blacklisted terms.

#### Defined in

[src/matcher/nfa/NfaMatcher.ts:627](https://github.com/jo3-l/obscenity/blob/563159b/src/matcher/nfa/NfaMatcher.ts#L627)

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

[src/matcher/nfa/NfaMatcher.ts:638](https://github.com/jo3-l/obscenity/blob/563159b/src/matcher/nfa/NfaMatcher.ts#L638)

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

[src/matcher/nfa/NfaMatcher.ts:651](https://github.com/jo3-l/obscenity/blob/563159b/src/matcher/nfa/NfaMatcher.ts#L651)
