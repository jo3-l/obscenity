[obscenity](../README.md) / CollapseDuplicatesTransformerOptions

# Interface: CollapseDuplicatesTransformerOptions

Options for the collapse duplicates transformer.

## Table of contents

### Properties

- [customThresholds](CollapseDuplicatesTransformerOptions.md#customthresholds)
- [defaultThreshold](CollapseDuplicatesTransformerOptions.md#defaultthreshold)

## Properties

### customThresholds

• `Optional` **customThresholds**: `Map`<`string`, `number`\>

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

**`default`** new Map()

#### Defined in

[src/transformer/collapse-duplicates/index.ts:103](https://github.com/jo3-l/obscenity/blob/cfc6c99/src/transformer/collapse-duplicates/index.ts#L103)

___

### defaultThreshold

• `Optional` **defaultThreshold**: `number`

The maximum number of characters in a run that will be accepted before
they will be collapsed.

For example, if this value was `2`, `aa` would stay the same but `aaa`
would be transformed to `aa`.

**`default`** 1

#### Defined in

[src/transformer/collapse-duplicates/index.ts:86](https://github.com/jo3-l/obscenity/blob/cfc6c99/src/transformer/collapse-duplicates/index.ts#L86)
