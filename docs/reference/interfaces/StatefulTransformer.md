[**obscenity**](../README.md)

***

[obscenity](../README.md) / StatefulTransformer

# Interface: StatefulTransformer

Defined in: [src/transformer/Transformers.ts:112](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/transformer/Transformers.ts#L112)

An interface that stateful transformers should implement.

## Properties

### transform

> **transform**: [`TransformerFn`](../type-aliases/TransformerFn.md)

Defined in: [src/transformer/Transformers.ts:125](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/transformer/Transformers.ts#L125)

Transforms input characters.

#### Param

Input character.

#### Returns

The transformed character. A return value of `undefined` indicates
that the character should be ignored.

## Methods

### reset()

> **reset**(): `void`

Defined in: [src/transformer/Transformers.ts:116](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/transformer/Transformers.ts#L116)

Resets the state of the transformer.

#### Returns

`void`
