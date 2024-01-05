# Obscenity

> Robust, extensible profanity filter for NodeJS.

<a href="https://github.com/jo3-l/obscenity/actions"><img src="https://img.shields.io/github/actions/workflow/status/jo3-l/obscenity/.github/workflows/continuous-integration.yml?branch=main&style=for-the-badge" alt="Build status"></a>
<a href="https://app.codecov.io/gh/jo3-l/obscenity/"><img src="https://img.shields.io/codecov/c/github/jo3-l/obscenity?style=for-the-badge" alt="Codecov status"></a>
<a href="https://npmjs.com/package/obscenity"><img src="https://img.shields.io/npm/v/obscenity?style=for-the-badge" alt="npm version"></a>
<img src='https://img.shields.io/github/languages/top/jo3-l/serenity.svg?style=for-the-badge' alt='Language'/>
<a href="https://github.com/jo3-l/obscenity/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/jo3-l/obscenity?style=for-the-badge" alt="License"></a>

## Why Obscenity?

- **Accurate:** Though Obscenity is far from perfect (as with all profanity filters), it makes reducing false positives as simple as possible: adding whitelisted phrases is as easy as adding a new string to an array, and using word boundaries is equally simple.
- **Robust:** Obscenity's transformer-based design allows it to match on variants of phrases other libraries are typically unable to, e.g. `f...u c k`, `fuuuuuuuckkk`, `ʃṳ𝒸𝗄`, `wordsbeforefuckandafter` and so on. There's no need to manually write out all the variants either: just adding the pattern `fuck` will match all of the cases above by default.
- **Extensible:** With Obscenity, you aren't locked into anything - removing phrases that you don't agree with from the default set of words is trivial, as is disabling any transformations you don't like (perhaps you feel that leet-speak decoding is too error-prone for you).

## Installation

```shell
$ npm install obscenity
$ yarn add obscenity
$ pnpm add obscenity
```

## Example usage

First, import Obscenity:

```javascript
const {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} = require('obscenity');
```

Or, in TypeScript/ESM:

```typescript
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';
```

Now, we can create a new matcher using the English preset.

```javascript
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

Now, we can use our matcher to search for profanities in the text. Here's two examples of what you can do:

**Check if there are any matches in some text:**

```javascript
if (matcher.hasMatch('f.uck you')) {
	console.log('The input text contains profanities.');
}
// The input text contains profanities.
```

**Output the positions of all matches along with the original word used:**

```javascript
// Pass "true" as the "sorted" parameter so the matches are sorted by their position.
const matches = matcher.getAllMatches('ʃ𝐟ʃὗƈｋ ỹоứ 𝔟!!!ⁱẗ𝙘ɦ', true);
for (const match of matches) {
	const { phraseMetadata, startIndex, endIndex } =
		englishDataset.getPayloadWithPhraseMetadata(match);
	console.log(
		`Match for word ${phraseMetadata.originalWord} found between ${startIndex} and ${endIndex}.`,
	);
}
// Match for word fuck found between 0 and 6.
// Match for word bitch found between 12 and 21.
```

**Censoring matched text:**

To censor text, we'll need to import another class: the `TextCensor`.
Some other imports and creation of the matcher have been elided for simplicity.

```javascript
const { TextCensor, ... } = require('obscenity');
// ...
const censor = new TextCensor();
const input = 'fuck you little bitch';
const matches = matcher.getAllMatches(input);
console.log(censor.applyTo(input, matches));
// %@$% you little **%@%
```

This is just a small slice of what Obscenity can do: for more, check out the [documentation](#documentation).

## Accuracy

> **Note:** As with all swear filters, Obscenity is not perfect (nor will it ever be). Use its output as a heuristic, and not as the sole judge of whether some content is appropriate or not.

With the English preset, Obscenity (correctly) finds matches in all of the following texts:

- you are a little **fuck**er
- **fk** you
- **ffuk** you
- i like **a$$es**
- <!-- prettier-ignore --> ʃ𝐟ʃὗƈｋ ỹоứ

...and it **does not match** on the following:

- the **pen is** mightier than the sword
- i love banan**as s**o yeah
- this song seems really b**anal**
- g**rape**s are really yummy

## Documentation

For a step-by-step guide on how to use Obscenity, check out the [guide](./docs/guide).

Otherwise, refer to the [auto-generated API documentation](./docs/reference).

## Contributing

Issues can be reported using the [issue tracker](https://github.com/jo3-l/obscenity/issues).
If you'd like to submit a pull request, please read the [contribution guide](./CONTRIBUTING.md) first.

## Author

**Obscenity** © [Joe L.](https://github.com/jo3-l/) under the MIT license. Authored and maintained by Joe L.

> GitHub [@jo3-l](https://github.com/jo3-l)
