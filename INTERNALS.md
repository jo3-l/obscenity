# How Obscenity works internally

Obscenity splits the profanity filtering process into two main stages.

First, the input is _sanitized_ (or _transformed_). The main class responsible for this is the `TransformerSet`, which takes a set of transformers and applies them to a certain character. Among other things, this is how duplicate characters, confusable Unicode characters, and leet-speak is handled.

Second, the patterns are actually matched against the input. The `WhitelistedTermMatcher` implements matching for whitelisted terms, while the `PatternMatcher` implements matching for blacklisted patterns.

# Multiple pattern matching

At a high level, profanity filtering simplifies to the question of "how do I match a set of patterns against an input quickly". One way to do this is to simply run a bunch of regular expressions on the input:

```
for each regular expression r:
	for each match of r in input:
		emit match
```

However, this is _slow_ (at least in theory). Notice that the outer loop runs _m_ times where _m_ is the number of regular expressions and the inner loop runs _n_ times where _n_ is the length of the input text, producing a runtime of `O(mn)`, which is suboptimal.

Let's step back a bit and consider the simpler question of multiple-string matching. In other words, "how do I match a set of strings against an input quickly". This is actually a fairly classic problem, and has several well-known solutions. The most popular one is the [Aho-Corasick](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm) algorithm, which finds matches in `O(n)` time where _n_ is the length of the string (some other factors are elided).

With this in mind, writing our `WhitelistedTermMatcher` class is easy, as whitelisted terms don't support any special syntax. Indeed, the `WhitelistedTermMatcher` is an Aho-Corasick implementation without any surprises.

[Note: The following section assumes that the reader is familiar with the normal Aho-Corasick algorithm].

However, we can't do this for the `PatternMatcher`, which supports a special construct, the _wildcard_, which matches any pattern (optional expressions can be simulated by expanding the pattern into two patterns whenever we see an optional expression, e.g. `a[b]` becomes `{a, ab}`).

If we could generalize the Aho-Corasick algorithm to support arbitrary-length wildcards without incurring too much overhead, then we'd be done. One way to achieve this is by introducing the concept of _partial patterns_. Let's say we have a pattern `a?b?c`. We can view this as three partial patterns `a`, `b`, `c`, where `a` has 0 leading wildcards and 1 leading wildcard; `b` has 1 leading wildcard and 1 trailing wildcard; and `c` has 1 leading wildcard and 0 trailing wildcard.

We will extend the trie with `a`, `b`, `c`, and mark the resulting leaf nodes as the end of partial matches. No other changes to the construction algorithm are necessary.

## How does this help us match wildcards?

Say that at some point we find pattern `a` has matched. We will mark the position at which it matched, and continue. Now, say pattern `b` also matches. We will check the previous positions for partial matches. Say we do find a partial match for `a` two positions before. In this case, we can combine the two partial matches; in other words, we found a match for `a?b`. And if, two positions after, we find a match for `c` as well, we can say that `a?b?c` matched. Why? Because the match for `b` was 1 character after `a`, and the match for `c` was 1 character after `b`.

This is quite a simplified explanation but hopefully it gets the point across. There are, of course, quite a few special cases to handle; the comments in the `PatternMatcher` implementation should suffice to explain them.
