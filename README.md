# Obscenity

<a href="https://github.com/jo3-l/obscenity/actions"><img src="https://img.shields.io/github/workflow/status/jo3-l/obscenity/Continuous%20Integration?style=for-the-badge" alt="Build status"></a>
<a href="https://app.codecov.io/gh/jo3-l/obscenity/"><img src="https://img.shields.io/codecov/c/github/jo3-l/obscenity?style=for-the-badge" alt="Codecov status"></a>
<a href="https://npmjs.com/package/obscenity"><img src="https://img.shields.io/npm/v/obscenity?style=for-the-badge" alt="npm version"></a>
<a href="https://github.com/jo3-l/obscenity/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/jo3-l/obscenity?style=for-the-badge" alt="License"></a>

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Example Usage](#example-usage)
- [Additional Examples](#additional-examples)
- [Writing your own patterns](#writing-your-own-patterns)
- [Documentation](#documentation)
- [Performance](#performance)
- [Contributing](#contributing)
- [Author](#author)

## About

> [obscenity](https://www.lexico.com/definition/obscenity) **əbˈsɛnɪti** _noun_
>
> 1.2. An extremely offensive word or expression.

Obscenity is a high-performance, robust **profanity filter** for NodeJS (with support for **TypeScript** as well). It is:

- **Relatively accurate:** To handle the famed [scunthorpe problem](https://en.wikipedia.org/wiki/Scunthorpe_problem), Obscenity supports word boundary assertions (so a pattern `|cunt` would only match `cunt`, `cunts`, ... but not `scunt`) in addition to whitelisting phrases.

  > As with all swear filters, Obscenity is not perfect (nor will it ever be). Use its output as a heuristic, and not as the sole judge of whether some content is appropriate or not.

- **Robust:** To counter common bypasses, Obscenity features _transformers_, which normalize the text before matching. Consequently, it can catch many obscene phrases that other libraries cannot.

  See the [example code](#example-usage) for some examples of what Obscenity can match.

- **Powerful:** Though Obscenity doesn't support regular expressions (as mentioned above), its pattern syntax does support arbitrary-length wildcards and optionals. Furthermore, thanks to transformers, a single pattern is often enough to match a lot of variations. With the default English preset, `fuck` matches all of the following:

  - `fucked`;
  - `f u u u u ck`;
  - `f....uu....ck`;
  - `inthemiddleofuckasentence`;
  - `ʃᵤс𝗄`.

- **Well tested:** Obscenity has an extensive test suite with 100% branch coverage in addition to fuzz tests using [fast-check](https://github.com/dubzzz/fast-check) for the pattern matcher.

## Installation

```sh-session
npm install obscenity
yarn add obscenity
pnpm add obscenity
```

## Example

First, import Obscenity:

```javascript
const { RegExpMatcher, englishDataset, englishRecommendedTransformers } = require('obscenity');

// Or, in ESM/TypeScript:
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
```

Next, create a `RegExpMatcher`, which implements matching blacklisted terms using regular expressions.

```javascript
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

Now, we can use it to check whether some input contains obscenities.

```javascript
const input = 'ʃʃᵤс𝗄 you';
console.log(matcher.hasMatch(input) ? 'The input contains obscenities.' : 'The input does not contain obscenities.');
// => "The input contains obscenities".
```

The example above matches on **all of the following**:

- you are a little **fuck**er
- **fk** you
- **fffuk** you
- i like **a$$es**
- aaa**ʃuck**you
- **f....uuuuu.......ck**

...and it **does not match** on the following:

- the **pen is** mightier than the sword
- i love banan**as s**o yeah
- this song seems really b**anal**
- g**rape**s are really yummy

## Additional Examples

### Censoring profane phrases

If you want to re-send the input with profanities changed to a less offensive phrase, you can do it with the help of Obscenity's `TextCensor` class.

The default censoring strategy used by the `TextCensor` is grawlix, but there are several other commonly used censoring strategies available. See the documentation for the [TextCensor](./docs/reference/classes/TextCensor.md) class for more details.

<details>
	<summary>Click to show code</summary>

```javascript
const { TextCensor, PatternMatcher, englishDataset, englishRecommendedTransformers } = require('obscenity');

const matcher = new PatternMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
const censor = new TextCensor();

const input = 'you are a fucking retard';
const matches = matcher.getAllMatches(input);
console.log(censor.applyTo(input, matches)); // you are a $$$*ing %&*%**
```

</details>

### Removing words from presets

If you want to use the English dataset but don't agree with some of the word choices, that's easy to fix! Just remove the word in question.

<details>
	<summary>Click to show code</summary>

```javascript
const { PatternMatcher, englishDataSet, englishRecommendedTransformers, DataSet } = require('obscenity');

// Create a custom dataset.
const myDataset = new DataSet()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.displayName === 'whore'); // remove 'whore'
const matcher = new PatternMatcher({
	...myDataset.build(),
	...englishRecommendedTransformers,
});
// ...
```

</details>

### Getting more information about the matches

TODO. Example coming soon!

### Writing your own patterns

To write your own patterns, see the documentation for the [pattern template tag](./docs/reference/README.md#pattern). A quick summary is:

- `?` matches any character: `a?` matches `ab`, `ac`, `ad`, `a-`, and so on.
- `|` at the start or end asserts position at a word boundary: `|cunt` matches `cunt`, `cunts`, ..., but not `scunt`.
- `[x]` makes `x` optional: `[s]up` matches both `sup` and `up`.

With this, we can begin writing some patterns. Let's say we want to match `hoe`. A pattern that comes to mind would just be `hoe` literally. However, that would match `shoe`, `phoenix`, `orthoepists`, and quite a few more. If we add a word boundary assertion to the start, though, the number of false positives decreases significantly: `|hoe`.

To actually use our new pattern, we need to register it with the `PatternMatcher`:

```javascript
const matcher = new PatternMatcher({
	blacklistedTerms: [{ id: 0, pattern: pattern`|hoe` }],
});
```

As you can see, in the above example, we had to assign an ID to the pattern. This might not be desirable if you don't really need to know which pattern matched (just that one did).
In that case, you can use the `assignIncrementingIds` utility, which does what its name says.

```javascript
const matcher = new PatternMatcher({
	blacklistedTerms: assignIncrementingIds([pattern`|hoe`]),
});
```

## Documentation

Refer to the [auto-generated API documentation](./docs/reference).

## Performance

TODO.

## Contributing

Issues can be reported using the [issue tracker](https://github.com/jo3-l/obscenity/issues).
If you'd like to submit a pull request, please read the [contribution guide](./CONTRIBUTING.md) first.

## Author

**Obscenity** © [Joe L.](https://github.com/jo3-l/) under the MIT license. Authored and maintained by Joe L.

> GitHub [@jo3-l](https://github.com/jo3-l)
