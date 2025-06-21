[**obscenity**](../README.md)

***

[obscenity](../README.md) / englishDataset

# Variable: englishDataset

> `const` **englishDataset**: [`DataSet`](../classes/DataSet.md)\<\{ `originalWord`: [`EnglishProfaneWord`](../type-aliases/EnglishProfaneWord.md); \}\>

Defined in: [src/preset/english.ts:103](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/preset/english.ts#L103)

A dataset of profane English words.

## Examples

```typescript
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});
```

```typescript
// Extending the data-set by adding a new word and removing an existing one.
const myDataset = new DataSet()
	.addAll(englishDataset)
	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'vagina')
	.addPhrase((phrase) => phrase.addPattern(pattern`|balls|`));
```

## Copyright

The words are taken from the [cuss](https://github.com/words/cuss) project,
with some modifications.

```text
(The MIT License)

Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
