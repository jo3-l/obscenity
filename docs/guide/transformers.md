# Transformers

> Learn all about transformers: what they are, built-in transformers, and how to make your own.

**Transformers** normalize text before it is passed to the matcher. For example, all of the following could be implementing using transformers:

- Confusable character resolution: `Ἢἕļľᦞ ш٥ṟｌᑰ!` -> `hello world`
- Leet-speak resolution: `h3llo world` -> `hello world`
- Duplicate character collapsing: `heeello world` -> `hello world`

## Simple transformers

In their simplest form, transformers are just functions that map characters to other characters. For example, a transformer that changes `a` to `b` and keeps other characters intact might look like:

```typescript
import { createSimpleTransformer } from 'obscenity';

const a = 'a'.charCodeAt(0);
const b = 'b'.charCodeAt(0);
const changeAToB = createSimpleTransformer((c) => (c === a ? b : c));
```

> **Note:** `createSimpleTransformer` is an adapter that returns the input function in a structure suitable for use with matchers, which are discussed in the next article. Don't forget to use it when creating transformers!

> **Warning:** Note that as transformers take the character _code_ as input rather than a string, implementing the transformer like this:
>
> ```typescript
> const changeAToB = createSimpleTransformer((c) => (c === 'a' ? 'b' : c));
> ```
>
> ...is, unfortunately, incorrect, as `c` is a number and would never be equal to `'a'`. Remember to always use character codes when writing transformers!

### Removing characters

Sometimes, changing characters isn't enough. Perhaps you want to completely ignore a character when matching. As an example, perhaps you want to skip the spaces in `f u c k` so it becomes `fuck`.

To do this, simply return `undefined` from the transformer, which signifies that the character should be ignored. With this in mind, we can easily write a transformer that skips spaces:

```typescript
import { createSimpleTransformer } from 'obscenity';

const space = ' '.charCodeAt(0);
const skipSpaces = createSimpleTransformer((c) => (c === space ? undefined : c));
```

## Stateful transformers

The aforementioned type of transformer is inadequate if you want to implement more complicated transformers, though. For example, if we wanted to implement a transformer that collapses duplicate characters, we'd hit a roadblock quite quickly in that we need to store the last character to check whether it's a duplicate, but simple transformers provide no clear way to do so.

This is where _stateful transformers_ come in handy. Stateful transformers are objects that implement the `StatefulTransformer` interface. More specifically, your object has to have the following methods:

- `transform(char)`, which takes a character and returns the transformed character.
- `reset()`, which resets any internal state the transformer has.

With this in mind, we can now write a stateful transformer that ignores duplicate characters:

```typescript
class CollapseDuplicates implements StatefulTransformer {
	private lastCharacter = -1;

	public transform(char: number) {
		if (char === this.lastCharacter) return undefined;
		this.lastCharacter = char;
		return char;
	}

	public reset() {
		this.lastCharacter = -1;
	}
}
```

Now, we can use the `createStatefulTransformer` adapter to get a structure suitable for use with matchers (discussed in the next article):

```typescript
import { createStatefulTransformer } from 'obscenity';

const collapseDuplicates = createStatefulTransformer(() => new CollapseDuplicates());
```

---

Excellent, you now know all about transformers! Now, let's take a look at the various built-in transformers Obscenity provides out of the box.

## Built-in transformers

Obscenity features a number of built-in transformers for common tasks.

- **Collapsing duplicate characters** is implemented by the `collapseDuplicatesTransformer()`: `fuuuuuuuck` becomes `fuck`;
- **Resolving confusable Unicode characters** is implemented by the `resolveConfusablesTransformer()`: ``Ἢἕļľᦞ ш٥ṟｌᑰ!` becomes `hello world!`;
- **Resolving leet-speak** is implemented by the `resolveLeetSpeakTransformer()`: `h3llo world` becomes `hello world`;
- **Skipping non-alphabetic characters** is implemented by the `skipNonAlphabeticTransformer()`: `f.u.c.. k` becomes `fuck`;
- **Converting characters to lower-case** is implemented by the `toAsciiLowerCaseTransformer()`: `fUCk` becomes `fuck`.

---

**Next up: [Matchers](./matchers.md).**
