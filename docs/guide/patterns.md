# Patterns

> Learn about Obscenity's custom pattern syntax.

**Patterns** are used to specify blacklisted words. To ease matching variations of words with only small changes, they support some special syntax (namely, wildcards, optional expressions, and boundary assertions). For example, the pattern `f?ck` matches `f`, then any character, then `ck`; and matches on `fuck`, `fbck`, `fyck`, `fack`, and so on.

## Why a custom pattern syntax?

This might sound similar to [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), which are widely used for similar purposes. Why not just use them instead of inventing some custom syntax? A few reasons:

- Regular expressions are overkill for profanity filtering in most cases. Their expressive syntax is, for the most part, completely unneeded as most variations are normalized before matching (see the article on [transformers](./transformers.md)).
- Not supporting all the features of regular expressions can make a more efficient implementation in certain cases. In addition to a simpler matcher implementation using regular expressions (ironically) and string searching methods, Obscenity also features a matcher implementation using finite automata techniques which searches for patterns in parallel, which may be useful if you have a large number of patterns.

## Pattern syntax

Most characters match _literally_. that is, `a` matches an `a`, `book` matches `book`, and so on. However, there are three special expressions that are available:

- **Wildcards:** A `?` matches any character.
- **Optional expressions:** Wrapping an expression in a set of square brackets (`[]`) matches it _optional_: `a[bc]` matches either `a` or `abc`.
- **Boundary assertions:** Placing a pipe (`|`) at the start or end of the pattern asserts position at a word boundary: `|tit` matches `tit` and `tits` but not `substitute`. Similarly, `chick|` matches
  `chick` but not `chicken`.

A special character mentioned above can be escaped using a backslash (`\`): `\?` matches `?` instead of a wildcard.

## Using patterns with Obscenity

A pattern may be created using the `parseRawPattern()` function:

```typescript
import { parseRawPattern } from 'obscenity';

const p = parseRawPattern('f?ck');
```

However, it is usually more convenient to use the `pattern` [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates):

```typescript
import { pattern } from 'obscenity';

const p = pattern`f?ck`;
```

Note the lack of `()` when calling `pattern` and the usage of backticks.

Due to how the `pattern` tagged template works internally, it is not necessary to double-escape backslashes:

```typescript
import { pattern } from 'obscenity';

const p = pattern`\[`;
```

If you were using `parseRawPattern` instead, the following would be required:

```typescript
const p = parseRawPattern('\\[');
```

---

**Next up: [Transformers](./transformers.md).**
