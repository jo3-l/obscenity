[**obscenity**](../README.md)

***

[obscenity](../README.md) / pattern

# Function: pattern()

> **pattern**(`strings`, ...`expressions`): [`ParsedPattern`](../interfaces/ParsedPattern.md)

Defined in: [src/pattern/Pattern.ts:106](https://github.com/jo3-l/obscenity/blob/df55df57c9cde0cfef01d92ac049af8e5d6ff36a/src/pattern/Pattern.ts#L106)

Parses a pattern, which matches a set of strings; see the `Syntax` section
for details. This function is intended to be called as a [template
tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

**Syntax**

Generally speaking, in patterns, characters are interpreted literally. That
is, they match exactly what they are: `a` matches an `a`, `b` matches a `b`,
`;` matches a `;`, and so on.

However, there are several constructs that have special meaning:

- `[expr]` matches either the empty string or `expr` (an **optional
  expression**). `expr` may be a sequence of literal characters or a wildcard
  (see below).
- `?` matches any character (a **wildcard**).
- A `|` at the start or end of the pattern asserts position at a word
  boundary (a **word boundary assertion**). If `|` is at the start, it
  ensures that the match either starts at the start of the string or a non-
  word character preceding it; if it is at the end, it ensures that the match
  either ends at the end of the string or a non-word character follows it.

  A word character is an lower-case or upper-case ASCII alphabet character or
  an ASCII digit.
- In a literal, a backslash may be used to **escape** one of the
  meta-characters mentioned above so that it does match literally: `\\[`
  matches `[`, and does not mark the start of an optional expression.

  **Note about escapes**

  As this function operates on raw strings, double-escaping backslashes is
  not necessary:

  ```typescript
  // Use this:
  const parsed = pattern`hello \[`;
  // Don't use this:
  const parsed = pattern`hello \\[`;
  ```

**Examples**

- `baz` matches `baz` exactly.

- `b\[ar` matches `b[ar` exactly.

- `d?ude` matches `d`, then any character, then `ude`. All of the following
  strings are matched by this pattern:
  - `dyude`
  - `d;ude`
  - `d!ude`

- `h[?]ello` matches either `h`, any character, then `ello` or the literal
  string `hello`. The set of strings it matches is equal to the union of the
  set of strings that the two patterns `hello` and `h?ello` match. All of the
  following strings are matched by this pattern:
  - `hello`
  - `h!ello`
  - `h;ello`

- `|foobar|` asserts position at a word boundary, matches the literal string
  `foobar`, and asserts position at a word boundary:
  - `foobar` matches, as the start and end of string count as word
    boundaries;
  - `yofoobar` does _not_ match, as `f` is immediately preceded by a word
    character;
  - `hello foobar bye` matches, as `f` is immediately preceded by a non-word
    character, and `r` is immediately followed by a non-word character.

**Grammar**

```
Pattern  ::= '['? Atom* ']'?
Atom     ::= Literal | Wildcard | Optional
Optional ::= '[' Literal | Wildcard ']'
Literal  ::= (NON_SPECIAL | '\' SUPPORTS_ESCAPING)+

NON_SPECIAL       ::= _any character other than '\', '?', '[', ']', or '|'_
SUPPORTS_ESCAPING ::= '\' | '[' | ']' | '?' | '|'
```

## Parameters

### strings

`TemplateStringsArray`

### expressions

...`unknown`[]

## Returns

[`ParsedPattern`](../interfaces/ParsedPattern.md)

The parsed pattern, which can then be used with the
[[RegExpMatcher]].

## Examples

```typescript
const parsed = pattern`hello?`; // match "hello", then any character
```

```typescript
const parsed = pattern`w[o]rld`; // match "wrld" or "world"
```

```typescript
const parsed = pattern`my initials are \[??\]`; // match "my initials are [", then any two characters, then a "]"
```

## Throws

[[ParserError]] if a syntactical error was detected while parsing the
pattern.

## See

[[parseRawPattern]] if you want to parse a string into a pattern without
using a template tag.
