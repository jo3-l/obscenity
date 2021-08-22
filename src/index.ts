export * from './censor/BuiltinStrategies';
export * from './censor/TextCensor';

export * from './dataset/DataSet';

export * from './matcher/BlacklistedTerm';
export * from './matcher/MatchPayload';
export * from './matcher/PatternMatcher';

export * from './pattern/Nodes';
export * from './pattern/ParserError';
export * from './pattern/Pattern';

export * from './preset/english';

export * from './transformer/collapse-duplicates';
export * from './transformer/remap-characters';
export * from './transformer/resolve-confusables';
export * from './transformer/resolve-leetspeak';
export * from './transformer/skip-non-alphabetic';
export * from './transformer/to-ascii-lowercase';

/**
 * The current version of the library, formatted as `MAJOR.MINOR.PATCH`.
 */
export const version = '0.1.0';
