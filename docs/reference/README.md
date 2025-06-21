**obscenity**

***

# obscenity

## Enumerations

- [SyntaxKind](enumerations/SyntaxKind.md)
- [TransformerType](enumerations/TransformerType.md)

## Classes

- [DataSet](classes/DataSet.md)
- [ParserError](classes/ParserError.md)
- [PhraseBuilder](classes/PhraseBuilder.md)
- [RegExpMatcher](classes/RegExpMatcher.md)
- [TextCensor](classes/TextCensor.md)

## Interfaces

- [BlacklistedTerm](interfaces/BlacklistedTerm.md)
- [BoundaryAssertionNode](interfaces/BoundaryAssertionNode.md)
- [CollapseDuplicatesTransformerOptions](interfaces/CollapseDuplicatesTransformerOptions.md)
- [LiteralNode](interfaces/LiteralNode.md)
- [Matcher](interfaces/Matcher.md)
- [MatchPayload](interfaces/MatchPayload.md)
- [OptionalNode](interfaces/OptionalNode.md)
- [ParsedPattern](interfaces/ParsedPattern.md)
- [PhraseContainer](interfaces/PhraseContainer.md)
- [ProcessedCollapseDuplicatesTransformerOptions](interfaces/ProcessedCollapseDuplicatesTransformerOptions.md)
- [RegExpMatcherOptions](interfaces/RegExpMatcherOptions.md)
- [SimpleTransformerContainer](interfaces/SimpleTransformerContainer.md)
- [StatefulTransformer](interfaces/StatefulTransformer.md)
- [StatefulTransformerContainer](interfaces/StatefulTransformerContainer.md)
- [WildcardNode](interfaces/WildcardNode.md)

## Type Aliases

- [CensorContext](type-aliases/CensorContext.md)
- [CharacterMapping](type-aliases/CharacterMapping.md)
- [EnglishProfaneWord](type-aliases/EnglishProfaneWord.md)
- [MatchPayloadWithPhraseMetadata](type-aliases/MatchPayloadWithPhraseMetadata.md)
- [Node](type-aliases/Node.md)
- [StatefulTransformerFactory](type-aliases/StatefulTransformerFactory.md)
- [TextCensorStrategy](type-aliases/TextCensorStrategy.md)
- [TransformerContainer](type-aliases/TransformerContainer.md)
- [TransformerFn](type-aliases/TransformerFn.md)

## Variables

- [englishDataset](variables/englishDataset.md)
- [englishRecommendedBlacklistMatcherTransformers](variables/englishRecommendedBlacklistMatcherTransformers.md)
- [englishRecommendedTransformers](variables/englishRecommendedTransformers.md)
- [englishRecommendedWhitelistMatcherTransformers](variables/englishRecommendedWhitelistMatcherTransformers.md)

## Functions

- [assignIncrementingIds](functions/assignIncrementingIds.md)
- [asteriskCensorStrategy](functions/asteriskCensorStrategy.md)
- [collapseDuplicatesTransformer](functions/collapseDuplicatesTransformer.md)
- [compareMatchByPositionAndId](functions/compareMatchByPositionAndId.md)
- [createSimpleTransformer](functions/createSimpleTransformer.md)
- [createStatefulTransformer](functions/createStatefulTransformer.md)
- [fixedCharCensorStrategy](functions/fixedCharCensorStrategy.md)
- [fixedPhraseCensorStrategy](functions/fixedPhraseCensorStrategy.md)
- [grawlixCensorStrategy](functions/grawlixCensorStrategy.md)
- [keepEndCensorStrategy](functions/keepEndCensorStrategy.md)
- [keepStartCensorStrategy](functions/keepStartCensorStrategy.md)
- [parseRawPattern](functions/parseRawPattern.md)
- [pattern](functions/pattern.md)
- [randomCharFromSetCensorStrategy](functions/randomCharFromSetCensorStrategy.md)
- [remapCharactersTransformer](functions/remapCharactersTransformer.md)
- [resolveConfusablesTransformer](functions/resolveConfusablesTransformer.md)
- [resolveLeetSpeakTransformer](functions/resolveLeetSpeakTransformer.md)
- [skipNonAlphabeticTransformer](functions/skipNonAlphabeticTransformer.md)
- [toAsciiLowerCaseTransformer](functions/toAsciiLowerCaseTransformer.md)
