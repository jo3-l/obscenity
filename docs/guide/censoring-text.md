# Censoring profane phrases

> Learn how to use censor strategies with Obscenity's `TextCensor` class.

Sometimes, simply checking for the presence of obscenity in text isn't enough. Instead, perhaps you wish to resend the text with the obscene phrases replaced with something else.

That's easy to do with the `TextCensor` class. It takes a _censor strategy_, and, given an input text and list of matches, returns the text with replacement text in place of the matches.
That sounds a bit complicated, so let's look at a simple example.

```typescript
import { TextCensor, RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const censor = new TextCensor();

const text = 'f u c k you!';
const matches = matcher.getAllMatches(text);
console.log(censor.applyTo(text, matches));
// Logs "@$** you!"
```

That might be good enough for your use-case, but say you want to customize the replacement string. Luckily, that's easy to do with _censor strategies_:

## Censor strategies

Censor strategies are simple functions that receive a _censor context_ and return a replacement string.
The most basic kind of censor strategy just returns a fixed string:

```typescript
const fudgeStrategy = () => 'fudge';
```

To use our censor strategy with the `TextCensor`, we can use the `setStrategy()` method:

```typescript
const censor = new TextCensor().setStrategy(fudgeStrategy);
// ...
console.log(censor.applyTo(text, matches));
// Logs "fudge you!"
```

Now, let's try writing a more advanced strategy which will generate asterisks, e.g. `**** you`. We can't just return a fixed string this time as the number of asterisks should vary (`ass` should become `***`, `fuck` `****`, and so on). However, we can make use of the first argument passed to censor strategies, the _censor context_:

```typescript
const asteriskStrategy = (ctx: CensorContext) => '*'.repeat(ctx.matchLength);
```

In this case, we return an asterisk repeated `ctx.matchLength` times. There are also a few other properties that are available on censor contexts:

- All the properties of `MatchPayload`s, as `CensorContext` extends `MatchPayload`. Thus, you could use `ctx.termId`, `ctx.startIndex`, `ctx.endIndex`, and so on.
- `input` - The input text.
- `overlapsAtStart` - Whether the current match overlaps at the start with some other match.
- `overlapsAtEnd` - Whether the current match overlaps at the end with some other match.

Going back to our asterisk censor strategy, we can again use the `setStrategy()` method to use it with our `TextCensor`:

```typescript
const censor = new TextCensor().setStrategy(asteriskStrategy);
// ...
console.log(censor.applyTo(text, matches));
// Logs "**** you!"
```

## Built-in censor strategies

Obscenity features a number of built-in censor strategies for common-use cases so you don't have to write them yourself:

- `grawlixCensorStrategy()` - The default; generates grawlix (strings that contain the characters `%`, `@`, `$`, `&`, and `*`).
- `asteriskCensorStrategy()` - Same as the one we discussed above.
- `keepStartCensorStrategy()` - This one is a bit special: it _extends_ another censor strategy by keeping the first character matched, e.g. `keepStartCensorStrategy(asteriskStrategy)` might produce `f***` as the replacement string.
- `keepEndCensorStrategy()` - Same as above, but keeps the last character matched instead.

In addition, there are some utilities to aide in writing custom censor strategies:

- `fixedPhraseCensorStrategy()` returns a censor strategy that produces a fixed phrase, e.g. `fixedPhraseCensorStrategy('fudge')` always returns `fudge`.
- `fixedCharCensorStrategy()` returns a censor strategy that produces the input character repeated an appropriate number of times, e.g. `fixedCharCensorStrategy('$')` might return `$$$`, `$$`, and so on.
- `randomCharFromSetCensorStrategy()` - returns a censor strategy that produces random characters from the set of characters given, repeated an appropriate number of times. For example, `randomCharFromSetCensorStrategy('%&')` might return `%%&`, `&%&&`, and so on.

---

Great, you now know all about censoring text (and if you've read the guide in order, all of Obscenity's features)!
If you have further questions, refer to the reference documentation.
