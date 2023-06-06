[obscenity](../README.md) / ParserError

# Class: ParserError

Custom error thrown by the parser when syntactical errors are detected.

## Hierarchy

- `Error`

  ↳ **`ParserError`**

## Table of contents

### Constructors

- [constructor](ParserError.md#constructor)

### Properties

- [column](ParserError.md#column)
- [line](ParserError.md#line)
- [message](ParserError.md#message)
- [name](ParserError.md#name)
- [stack](ParserError.md#stack)

## Constructors

### constructor

• **new ParserError**(`message`, `line`, `column`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `line` | `number` |
| `column` | `number` |

#### Overrides

Error.constructor

#### Defined in

[src/pattern/ParserError.ts:18](https://github.com/jo3-l/obscenity/blob/79cfa63/src/pattern/ParserError.ts#L18)

## Properties

### column

• `Readonly` **column**: `number`

The column on which the error occurred (one-based).
Note that surrogate pairs are counted as 1 column wide, not 2.

#### Defined in

[src/pattern/ParserError.ts:16](https://github.com/jo3-l/obscenity/blob/79cfa63/src/pattern/ParserError.ts#L16)

___

### line

• `Readonly` **line**: `number`

The line on which the error occurred (one-based).

#### Defined in

[src/pattern/ParserError.ts:10](https://github.com/jo3-l/obscenity/blob/79cfa63/src/pattern/ParserError.ts#L10)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/.pnpm/typescript@4.3.5/node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• `Readonly` **name**: ``"ParserError"``

#### Overrides

Error.name

#### Defined in

[src/pattern/ParserError.ts:5](https://github.com/jo3-l/obscenity/blob/79cfa63/src/pattern/ParserError.ts#L5)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/.pnpm/typescript@4.3.5/node_modules/typescript/lib/lib.es5.d.ts:975
