# Matchers

> Learn about Obscenity's `Matcher` interface and its implementations.

We've previously discussed patterns and transformers. It's time to learn about how to use Obscenity to search for blacklisted terms in text, while respecting whitelisted terms.

To facilitate this, Obscenity provides the `RegExpMatcher`, which -- as the name suggests -- implements matching using regular expressions and string searching methods. At a high level, all it does is:

```
apply transformations to text before matching whitelisted terms
find whitelisted terms in text

apply transformations to text before matching blacklisted terms
for each blacklisted term
	for all matches of the blacklisted term in the text
		if a whitelisted term did not match this part of the text
			emit match
```

For now, the `RegExpMatcher` is the only matcher implementation offered by Obscenity, though this may change in future versions.

## Providing matcher options

Matchers support several options:

- `blacklistedTerms` - a list of blacklisted terms. Blacklisted terms are objects with a unique ID that identify them and a pattern, e.g. `` { id: 0, pattern: pattern`my pattern` } ``.

  > **Tip:** If you only want to supply a list of patterns (as you don't care about knowing exactly which pattern matched, you can use the `assignIncrementingIds` utility):
  >
  > ```typescript
  > import { RegExpMatcher, assignIncrementingIds, pattern } from 'obscenity';
  >
  > const matcher = new RegExpMatcher({
  > 	blacklistedTerms: assignIncrementingIds([pattern`my pattern`]),
  > });
  > ```

- `whitelistedTerms` - a list of whitelisted terms, which are just strings.

- `blacklistMatcherTransformers` - a set of transformers that should be applied to the text before matching blacklisted terms. They will be applied in the order they are given.

- `whitelistMatcherTransformers` - a set of transformers that should be applied to the text before matching whitelisted terms. They will be applied in the order they are given.

### Example

```typescript
import { RegExpMatcher, pattern } from 'obscenity';

const matcher = new RegExpMatcher({
	blacklistedTerms: [
		{ id: 0, pattern: pattern`hi` },
		{ id: 1, pattern: pattern`bye` },
	],
	whitelistedTerms: ['achingly'],
	blacklistMatcherTransformers: [skipSpaces],
	whitelistMatcherTransformers: [],
});
```

This will match `hi` and `bye` (ignoring spaces) unless the `hi` is part of `achingly` (not ignoring spaces).

## Presets

While coming up with your own list of blacklisted terms / whitelisted terms / transformers is a possibility, it does take quite a bit of time if you want to make sure you have few false positives and match as many variants as possible.

To save you some work, Obscenity features _presets_, which are sets of blacklisted terms, whitelisted terms, and transformers. For example, to use the English preset:

```typescript
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

### Available presets

The English preset is the only one available at the moment, but more may be added in the future.

## Using the matcher

Now, we can use our matcher to answer some questions about our text. Namely, we can ask it whether the text contains any blacklisted terms, and where those blacklisted terms appeared.

To check whether the text contains any blacklisted terms, we can use the `hasMatch()` method:

```typescript
const hasMatch = matcher.hasMatch(input);
```

This should be preferred if you do not need to know which terms matched and where they matched.

If you do need to obtain more information about the matches, though, you can use `getAllMatches()`:

```typescript
const payloads = matcher.getAllMatches(input);
```

You may notice that the resulting list of matches is not sorted. That is, matches beginning at a higher index might come before matches beginning at a lower index.
If having a sorted list of matches is a requirement for your code, you can pass `true` as an argument to `getAllMatches`.

```typescript
const sortedPayloads = matcher.getAllMatches(input, true);
```

`getAllMatches()` returns a list of match payloads, which contain four pieces of information:

- `termId` - the ID of the term that matched;
- `startIndex` - the start index of the match, inclusive;
- `endIndex` - the end index of the match, inclusive;
- `matchLength` - the number of characters that matched.

The information emitted may not be enough for your use-case (perhaps you want to track the type of word was used, what the original word was, etc.). If that's the case, be sure to check out the next article!

---

**Next up: [Datasets](./datasets.md).**
