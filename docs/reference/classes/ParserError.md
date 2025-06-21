[**obscenity**](../README.md)

***

[obscenity](../README.md) / ParserError

# Class: ParserError

Defined in: [src/pattern/ParserError.ts:4](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/pattern/ParserError.ts#L4)

Custom error thrown by the parser when syntactical errors are detected.

## Extends

- `Error`

## Constructors

### Constructor

> **new ParserError**(`message`, `line`, `column`): `ParserError`

Defined in: [src/pattern/ParserError.ts:18](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/pattern/ParserError.ts#L18)

#### Parameters

##### message

`string`

##### line

`number`

##### column

`number`

#### Returns

`ParserError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.8.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Error.cause`

***

### column

> `readonly` **column**: `number`

Defined in: [src/pattern/ParserError.ts:16](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/pattern/ParserError.ts#L16)

The column on which the error occurred (one-based).
Note that surrogate pairs are counted as 1 column wide, not 2.

***

### line

> `readonly` **line**: `number`

Defined in: [src/pattern/ParserError.ts:10](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/pattern/ParserError.ts#L10)

The line on which the error occurred (one-based).

***

### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@5.8.3/node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> `readonly` **name**: `"ParserError"` = `'ParserError'`

Defined in: [src/pattern/ParserError.ts:5](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/pattern/ParserError.ts#L5)

#### Overrides

`Error.name`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/.pnpm/typescript@5.8.3/node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`
