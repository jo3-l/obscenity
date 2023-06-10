# Censoring Profane Phrases

> Learn how to censor text with Obscenity's `TextCensor`.

A common strategy to deal with content containing banned phrases is to _censor_
them by replacing the offending parts of the content with placeholders.

Obscenity's `TextCensor` class makes this simple. Consider the following basic
example:

```typescript
import { TextCensor, RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const censor = new TextCensor(); // (1)

const text = 'f u c k you!';
const matches = matcher.getAllMatches(text);
console.log(censor.applyTo(text, matches)); // (2)
//> "@$** you!"
```

We start by constructing a `TextCensor` (1). Then, we apply this censor to a
piece of content by invoking the `applyTo` method with the original text along
with the set of matches (2).

Note that in the above example the offending content has been replaced with
[grawlix](https://en.wikipedia.org/wiki/Grawlix). However, if this is
undesirable for your use-case, the replacement text can be easily customized
by providing your own _censor strategy_.

## Censor Strategies

A censor strategy specifies how to generate replacement text given a match.
Under the hood, a censor strategy is simply a function that receives a _censor
context_ and returns a replacement string.

The most basic type of censor strategy simply returns a fixed replacement
string:

```typescript
const fudgeStrategy = () => 'fudge';
```

To use this censor strategy, we use the `setStrategy` method on our
`TextCensor`:

```typescript
const censor = new TextCensor().setStrategy(fudgeStrategy);
// ...
console.log(censor.applyTo(text, matches));
//> "fudge you!"
```

We can also create more complex strategies that generate output dynamically
based on the specific text matched. For instance, let us try writing a strategy
that will generate a string of asterisks of varying length ⸺ `ass` should become
`***`, `fuck` `****`, and so on. To do this, we can use the `matchLength` property
of the censor context:

```typescript
const asteriskStrategy = (ctx: CensorContext) => '*'.repeat(ctx.matchLength);
```

which works as expected:

```typescript
const censor = new TextCensor().setStrategy(asteriskStrategy);
// ...
console.log(censor.applyTo(text, matches));
//> "**** you!"
```

Other than the match length, censor contexts also include the following data:

- All the properties of `MatchPayload`s, as `CensorContext` extends
  `MatchPayload`. Thus, `ctx.termId`, `ctx.startIndex`, `ctx.endIndex`, and so
  on are all accessible.
- `input` ⸺ The input text.
- `overlapsAtStart` ⸺ Whether the current match overlaps at the start with some other match.
- `overlapsAtEnd` ⸺ Whether the current match overlaps at the end with some other match.

## Built-in Censor Strategies

Obscenity exports the two censor strategies discussed in this article to save
you the work of implementing them yourself:

- `grawlixCensorStrategy()` ⸺ Generates grawlix; this is the default strategy.
- `asteriskCensorStrategy()` ⸺ Generates repeated asterisks..

In addition, a number of utilities are provided to aid in writing custom censor
strategies:

- `fixedPhraseCensorStrategy()` ⸺ Returns a censor strategy that produces a
  fixed phrase. For example, `fixedPhraseCensorStrategy('fudge')` always returns
  `fudge`.
- `fixedCharCensorStrategy()` ⸺ Returns a censor strategy that produces the
  input character repeated an appropriate number of times. For example,
  `fixedCharCensorStrategy('$')` might return `$`, `$$`, `$$`, and so on.
- `randomCharFromSetCensorStrategy()` ⸺ Returns a censor strategy that produces
  random characters from the set of characters given, repeated an appropriate
  number of times. For example, `randomCharFromSetCensorStrategy('%&')` might
  return `%%&`, `&%&&`, and so on.
- `keepStartCensorStrategy()` ⸺ Extends another censor strategy by keeping the
  first character matched. For example,
  `keepStartCensorStrategy(asteriskStrategy)` might produce `f***` as the
  replacement string.
- `keepEndCensorStrategy()` ⸺ Same as above, but keeps the last character
  matched instead.

---

Great, now you know all about censoring text (and if you've read the guide in
order, all of Obscenity's features)! If you have further questions, consult the
reference documentation.
