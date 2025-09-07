[**obscenity**](../README.md)

***

[obscenity](../README.md) / parseRawPattern

# Function: parseRawPattern()

> **parseRawPattern**(`pattern`): [`ParsedPattern`](../interfaces/ParsedPattern.md)

Defined in: [src/pattern/Pattern.ts:130](https://github.com/jo3-l/obscenity/blob/907e5d7d34bb29e7d66f262535368ae2d124a8eb/src/pattern/Pattern.ts#L130)

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
