[**obscenity**](../README.md)

***

[obscenity](../README.md) / assignIncrementingIds

# Function: assignIncrementingIds()

> **assignIncrementingIds**(`patterns`): [`BlacklistedTerm`](../interfaces/BlacklistedTerm.md)[]

Defined in: [src/matcher/BlacklistedTerm.ts:37](https://github.com/jo3-l/obscenity/blob/ae4d9794c82884d20a8b302b776b16d7a17f2d99/src/matcher/BlacklistedTerm.ts#L37)

Assigns incrementing IDs to the patterns provided, starting with 0. It is
useful if you have a list of patterns to match against but don't care about
identifying which pattern matched.

## Parameters

### patterns

[`ParsedPattern`](../interfaces/ParsedPattern.md)[]

List of parsed patterns.

## Returns

[`BlacklistedTerm`](../interfaces/BlacklistedTerm.md)[]

A list of blacklisted terms with valid IDs which can then be passed
to the [[RegExpMatcher]].

## Example

```typescript
const matcher = new RegExpMatcher({
 ...,
 blacklistedTerms: assignIncrementingIds([
     pattern`f?uck`,
     pattern`|shit|`,
 ]),
});
```
