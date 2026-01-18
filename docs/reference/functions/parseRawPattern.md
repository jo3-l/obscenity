[**obscenity**](../README.md)

***

[obscenity](../README.md) / parseRawPattern

# Function: parseRawPattern()

> **parseRawPattern**(`pattern`): [`ParsedPattern`](../interfaces/ParsedPattern.md)

Defined in: [src/pattern/Pattern.ts:130](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/pattern/Pattern.ts#L130)

Parses a string as a pattern directly.

**Note**

It is recommended to use the [[pattern | pattern template tag]] instead of
this function for literal patterns (i.e. ones without dynamic content).

## Parameters

### pattern

`string`

The string to parse.

## Returns

[`ParsedPattern`](../interfaces/ParsedPattern.md)

The parsed pattern, which can then be used with the
[[RegExpMatcher]].

## Throws

[[ParserError]] if a syntactical error was detected while parsing the
pattern.
