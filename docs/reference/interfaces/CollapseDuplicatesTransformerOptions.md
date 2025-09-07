[**obscenity**](../README.md)

***

[obscenity](../README.md) / CollapseDuplicatesTransformerOptions

# Interface: CollapseDuplicatesTransformerOptions

Defined in: [src/transformer/collapse-duplicates/index.ts:75](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/transformer/collapse-duplicates/index.ts#L75)

Options for the collapse duplicates transformer.

## Properties

### customThresholds?

> `optional` **customThresholds**: `Map`\<`string`, `number`\>

Defined in: [src/transformer/collapse-duplicates/index.ts:91](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/transformer/collapse-duplicates/index.ts#L91)

Custom thresholds for characters. If a character has an entry
corresponding to it, the value of tne entry will be used as the maximum
length of character runs comprised of said character before they are
collapsed.

The intended use-case for this option is for characters which appear
more than once in a row in patterns. For example, the word `book` has
two `o`s in a row, and matches `book`. With this transformer, though,
`book` would become `bok`, meaning that `book` would no longer match `book`.
The fix would be to add an entry corresponding to `o` that overrides its
threshold to be `2`, with the effect of leaving `book` unchanged.

#### Default

```ts
new Map()
```

***

### defaultThreshold?

> `optional` **defaultThreshold**: `number`

Defined in: [src/transformer/collapse-duplicates/index.ts:102](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/transformer/collapse-duplicates/index.ts#L102)

The maximum number of characters in a run that will be accepted before
they will be collapsed.

For example, if this value was `2`, `aa` would stay the same but `aaa`
would be transformed to `aa`.

#### Default

```ts
1
```
