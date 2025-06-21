[**obscenity**](../README.md)

***

[obscenity](../README.md) / RegExpMatcherOptions

# Interface: RegExpMatcherOptions

Defined in: [src/matcher/regexp/RegExpMatcher.ts:219](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/regexp/RegExpMatcher.ts#L219)

Options for the [[RegExpMatcher]].

## Properties

### blacklistedTerms

> **blacklistedTerms**: [`BlacklistedTerm`](BlacklistedTerm.md)[]

Defined in: [src/matcher/regexp/RegExpMatcher.ts:234](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/regexp/RegExpMatcher.ts#L234)

A list of blacklisted terms.

***

### blacklistMatcherTransformers?

> `optional` **blacklistMatcherTransformers**: [`TransformerContainer`](../type-aliases/TransformerContainer.md)[]

Defined in: [src/matcher/regexp/RegExpMatcher.ts:229](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/regexp/RegExpMatcher.ts#L229)

A set of transformers that should be applied to the input text before
blacklisted patterns are matched. This does not affect the matching of
whitelisted terms.

Transformers will be applied in the order they appear.

#### Default

```ts
[]
```

***

### whitelistedTerms?

> `optional` **whitelistedTerms**: `string`[]

Defined in: [src/matcher/regexp/RegExpMatcher.ts:258](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/regexp/RegExpMatcher.ts#L258)

A list of whitelisted terms. If a whitelisted term matches some part of
the text, a match of a blacklisted pattern within that part of the text
will not be emitted.

For example, if we had a pattern `penis` and a whitelisted term `pen is`,
only no matches would be reported for the input text `the pen is mightier
than the sword.`

#### Default

```ts
[]
```

***

### whitelistMatcherTransformers?

> `optional` **whitelistMatcherTransformers**: [`TransformerContainer`](../type-aliases/TransformerContainer.md)[]

Defined in: [src/matcher/regexp/RegExpMatcher.ts:245](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/regexp/RegExpMatcher.ts#L245)

A set of transformers that should be applied to the input text before
whitelisted terms are matched. This does not affect the matching of
blacklisted terms.

Transformers will be applied in the order they appear.

#### Default

```ts
[]
```
