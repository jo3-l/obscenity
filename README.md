# Obscenity

TODO: Badges.

[obscenity](https://www.lexico.com/definition/obscenity) **əbˈsɛnɪti** _noun_

1.2. An extremely offensive word or expression.

## About

Obscenity is a high-performance, robust **profanity filter** for NodeJS (with support for **TypeScript** as well). It is:

- **Accurate:** To handle the famed [scunthorpe problem](https://en.wikipedia.org/wiki/Scunthorpe_problem), Obscenity supports word boundary assertions (so a pattern `|cunt` would only match `cunt`, `cunts`, ... but not `scunt`) in addition to whitelisting phrases.

- **Robust:** To counter common bypasses, Obscenity features _transformers_, which normalize the text before matching. Consequently, it can catch many obscene phrases that other libraries cannot.

  See the [example code](#example-usage) for some examples of what Obscenity can match against.

- **Fast:** Obscenity's pattern matcher doesn't use regular expressions. Instead, it uses finite automata, making it very fast. [Benchmarks](#performance) show that, with the English preset (~100 patterns), it is consistently **3x faster** than an equivalent approach with string methods and regular expressions.

- **Powerful:** Though Obscenity doesn't support regular expressions (as mentioned above), its pattern syntax does support arbitrary-length wildcards and optionals. Furthermore, thanks to transformers, a single pattern is often enough to match a lot of variations. With the default English preset, `fuck` matches all of the following:
  - `f u u u u ck`;
  - `f....uu....ck`;
  - `inthemiddleofuckasentence`;
  - `ʃᵤс𝗄`.

## Installation

```sh-session
npm install obscenity
yarn add obscenity
pnpm add obscenity
```

## Example Usage

```javascript
const {
	PatternMatcher,
	englishDataset,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedWhitelistMatcherTransformers,
} = require('obscenity');

// Creating a matcher is somewhat expensive, so do this only once in your app if possible:
const matcher = new PatternMatcher({
	...englishDataset.build(),
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
});

const input = 'ʃʃᵤс𝗄 you';
console.log(
	matcher.setInput(input).hasMatch() ? 'The input contains obscenities.' : 'The input does not contain obscenities.',
);
```

The above example matches on **all of the following**:

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

The default censoring strategy used by the `TextCensor` is grawlix, but there are several other commonly used censoring strategies available. See the documentation for the [TextCensor](TODO) class for more details.

<details>
	<summary>Click to show code</summary>

```javascript
const {
	TextCensor,
	PatternMatcher,
	englishDataset,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedWhitelistMatcherTransformers,
} = require('obscenity');

const matcher = new PatternMatcher({
	...englishDataset.build(),
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
});
const censor = new TextCensor();

const input = 'you are a fucking retard';
const matches = matcher.setInput(input).getAllMatches();
console.log(censor.applyTo(input, matches)); // you are a $$$*ing %&*%**
```

</details>

### Removing words from presets

If you want to use the English dataset but don't agree with some of the word choices, that's easy to fix! Just remove the word in question.

<details>
	<summary>Click to show code</summary>

```javascript
const {
	PatternMatcher,
	englishDataSet,
	englishRecommendedBlacklistMatcherTransformers,
	englishRecommendedWhitelistMatcherTransformers,
	DataSet,
} = require('obscenity');

// Create a custom dataset.
const myDataset = new DataSet()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.displayName === 'whore'); // remove 'whore'
const matcher = new PatternMatcher({
	...myDataset.build(),
	blacklistMatcherTransformers: englishRecommendedBlacklistMatcherTransformers,
	whitelistMatcherTransformers: englishRecommendedWhitelistMatcherTransformers,
});
// ...
```

</details>

## Writing your own patterns

To write your own patterns, see the documentation for the [pattern template tag](TODO). A quick summary is:

- `?` matches any character: `a?` matches `ab`, `ac`, `ad`, `a-`, and so on.
- `|` at the start or end asserts position at a word boundary: `|cunt` matches `cunt`, `cunts`, ..., but not `scunt`.
- `[x]` makes `x` optional: `[s]up` matches both `sup` and `up`.

With this, we can begin writing some patterns. Let's say we want to match `hoe`. A pattern that comes to mind would just be `hoe` literally. However, that would match `shoe`, `phoenix`, `orthoepists`, and quite a few more. If we add a word boundary assertion to the start, though, the number of false positives decreases significantly: `|hoe`.

To actually use our new pattern, we need to register it with the `PatternMatcher`:

```javascript
const matcher = new PatternMatcher({
	blacklistedPatterns: [{ id: 0, pattern: pattern`|hoe` }],
});
```

As you can see, in the above example, we had to assign an ID to the pattern. This might not be desirable if you don't really need to know which pattern matched (just that one did).
In that case, you can use the `assignIncrementingIds` utility, which does what its name says.

```javascript
const matcher = new PatternMatcher({
	blacklistedPatterns: assignIncrementingIds([pattern`|hoe`]),
});
```

## Documentation

- [Auto-generated API documentation](TODO)
- [Article about how Obscenity works internally](TODO)

## Performance

TODO.

## Author

**Obscenity** © [Joe L.](https://github.com/jo3-l/) under the MIT license. Authored and maintained by Joe L.

> GitHub [@jo3-l](https://github.com/jo3-l)
