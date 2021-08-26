import type { LiteralNode } from '../../pattern/Nodes';
import { SyntaxKind } from '../../pattern/Nodes';
import type { SimpleNode } from '../../pattern/Simplifier';
import { simplify } from '../../pattern/Simplifier';
import type { LiteralGroup, WildcardGroup } from '../../pattern/Util';
import { computePatternMatchLength, groupByNodeType } from '../../pattern/Util';
import type { TransformerContainer } from '../../transformer/Transformers';
import { TransformerSet } from '../../transformer/TransformerSet';
import { isHighSurrogate, isLowSurrogate, isWordChar } from '../../util/Char';
import { CharacterIterator } from '../../util/CharacterIterator';
import { CircularBuffer } from '../../util/CircularBuffer';
import { Queue } from '../../util/Queue';
import type { BlacklistedTerm } from '../BlacklistedTerm';
import { IntervalCollection } from '../IntervalCollection';
import type { Matcher } from '../Matcher';
import type { MatchPayload } from '../MatchPayload';
import { compareMatchByPositionAndId } from '../MatchPayload';
import type { PartialMatchData } from './trie/BlacklistTrieNode';
import { BlacklistTrieNode, hashPartialMatch, NodeFlag, PartialMatchFlag, SharedFlag } from './trie/BlacklistTrieNode';
import type { ForwardingEdgeCollection } from './trie/edge/ForwardingEdgeCollection';
import { WhitelistedTermMatcher } from './WhitelistedTermMatcher';

/**
 * An implementation of the [[Matcher]] interface using finite automata
 * techniques.
 *
 * It is theoretically faster than the [[RegExpMatcher]]: the `hasMatch()` and
 * `getAllMatches()` execute in time proportional only to that of the length of
 * the input text and the number of matches. In other words, it _theoretically_
 * should not degrade in performance as you add more terms - matching with 100
 * and 1000 patterns should have the same performance. It achieves this by
 * building a heavily modified [Aho-Corasick
 * automaton](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm) from
 * the input patterns.
 *
 * In practice, its high constant factors make it slower than the
 * [[RegExpMatcher]] until about ~100 patterns, at which point both
 * implementations have approximately the same performance.
 *
 * The regular-expression matcher should be preferred to this one if at all
 * possible, as it uses more memory and is only marginally faster at the scale
 * most users of this package are expected to use it at. However, it may be
 * appropriate if:
 *
 * - You have a large number of patterns (> 100);
 * - You expect to be matching on long text;
 * - You have benchmarked the implementations and found the [[NfaMatcher]] to be
 *   noticeably faster.
 */
export class NfaMatcher implements Matcher {
	private readonly rootNode = new BlacklistTrieNode();
	private readonly originalIds: number[] = []; // originalIds[i] is the term ID of the the pattern with ID i
	private readonly matchLengths: number[] = []; // matchLengths[i] is the match length of the pattern with ID i
	private readonly partialMatchStepCounts = new Map<number, number>(); // partialMatchStepCounts[i] is the total number of steps of the pattern with ID i. Only applies to partial matches.
	private readonly wildcardOnlyPatterns: WildcardOnlyPatternData[] = [];
	// Maximum number of trailing wildcards.
	//
	// x x x ? y y ? ? ? ?
	//             ^^^^^^^
	//        4 trailing wildcards
	private maxTrailingWildcardCount = 0;
	// Maximum distance between the start of a partial pattern and the end of the partial pattern following it.
	//
	// x x x ? ? ? y y y y
	// 0 1 2 3 4 5 6 7 8 9
	// ^^^^^^^^^^^^^^^^^^^
	//    distance of 10
	//
	// This value is equal to how long we need to keep partial matches around.
	private maxPartialPatternDistance = 0;
	private maxMatchLength = 0; // Maximum match length of any pattern, equal to how many indices to the left of the current position we need to track.
	private currentId = 0; // Current generated pattern ID.

	private readonly whitelistedTermMatcher: WhitelistedTermMatcher;
	private readonly slowTransformers: TransformerSet;
	private readonly fastTransformers: TransformerSet;

	// Use two iterators: one fast, and one slow. The fast iterator will
	// constantly be |maxTrailingWildcardCount| positions head of the slow
	// iterator.
	private readonly slowIter = new CharacterIterator();
	private readonly fastIter = new CharacterIterator();

	// Sliding window of indices used for matching.
	//
	//             current position
	//                 |
	// i0 i1 i2 i3 i4 i5
	// ^^^^^^^^^^^^^^^^^
	//  maxMatchLength
	private readonly usedIndices: CircularBuffer<number>;
	// Sliding window of indices to the right of the current position.
	//
	// current position
	// |
	//   i6 i7 i8 i9 i10 i11 i12 i13
	//   ^^^^^^^^^^^^^^^^^^^^^^^^^^
	//    maxTrailingWildcardCount
	private readonly futureIndices: CircularBuffer<number | undefined>;
	private matches: MatchPayload[] = [];
	private readonly partialMatches: CircularBuffer<Set<string> | undefined>; // partial matches found; value is a set of partial match hashes
	private currentNode = this.rootNode;
	private whitelistedIntervals = new IntervalCollection();

	/**
	 * Creates a new [[NfaMatcher]] with the options given.
	 *
	 * @example
	 * ```typescript
	 * // Use the options provided by the English preset.
	 * const matcher = new NfaMatcher({
	 * 	...englishDataset.build(),
	 * 	...englishRecommendedTransformers,
	 * });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Simple matcher that only has blacklisted patterns.
	 * const matcher = new NfaMatcher({
	 *  blacklistedTerms: assignIncrementingIds([
	 *      pattern`fuck`,
	 *      pattern`f?uck`, // wildcards (?)
	 *      pattern`bitch`,
	 *      pattern`b[i]tch` // optionals ([i] matches either "i" or "")
	 *  ]),
	 * });
	 *
	 * // Check whether some string matches any of the patterns.
	 * const doesMatch = matcher.hasMatch('fuck you bitch');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // A more advanced example, with transformers and whitelisted terms.
	 * const matcher = new NfaMatcher({
	 *  blacklistedTerms: [
	 *      { id: 1, pattern: pattern`penis` },
	 *      { id: 2, pattern: pattern`fuck` },
	 *  ],
	 *  whitelistedTerms: ['pen is'],
	 *  blacklistMatcherTransformers: [
	 *      resolveConfusablesTransformer(), // '🅰' => 'a'
	 *      resolveLeetSpeakTransformer(), // '$' => 's'
	 *      foldAsciiCharCaseTransformer(), // case insensitive matching
	 * 	    skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
	 *      collapseDuplicatesTransformer(), // 'aaaa' => 'a'
	 *  ],
	 * });
	 *
	 * // Output all matches.
	 * console.log(matcher.getAllMatches('fu.....uuuuCK the pen is mightier than the sword!'));
	 * ```
	 *
	 * @param options - Options to use.
	 */
	public constructor({
		blacklistedTerms,
		whitelistedTerms = [],
		blacklistMatcherTransformers = [],
		whitelistMatcherTransformers = [],
	}: NfaMatcherOptions) {
		this.whitelistedTermMatcher = new WhitelistedTermMatcher({
			terms: whitelistedTerms,
			transformers: whitelistMatcherTransformers,
		});
		this.slowTransformers = new TransformerSet(blacklistMatcherTransformers);
		this.fastTransformers = new TransformerSet(blacklistMatcherTransformers);
		this.ensureNoDuplicates(blacklistedTerms.map((p) => p.id));
		this.buildTrie(blacklistedTerms);
		this.constructLinks();
		this.useUnderlyingEdgeCollectionImplementation(this.rootNode);

		// Sort wildcard-only patterns by the number of wildcards they have.
		this.wildcardOnlyPatterns.sort((a, b) =>
			/* istanbul ignore next: not really possible to write a robust test for this */
			a.wildcardCount < b.wildcardCount ? -1 : b.wildcardCount < a.wildcardCount ? 1 : 0,
		);
		this.usedIndices = new CircularBuffer(this.maxMatchLength);
		this.futureIndices = new CircularBuffer(this.maxTrailingWildcardCount);
		this.partialMatches = new CircularBuffer(this.maxPartialPatternDistance);
	}

	public hasMatch(input: string) {
		this.setInput(input);
		const hasMatch = this.run(true);
		return hasMatch;
	}

	public getAllMatches(input: string, sorted = false) {
		this.setInput(input);
		this.run();
		if (sorted) this.matches.sort(compareMatchByPositionAndId);
		return this.matches;
	}

	private setInput(input: string) {
		this.slowIter.setInput(input);
		this.fastIter.setInput(input);
		this.whitelistedIntervals = this.whitelistedTermMatcher.getMatches(input);
		this.currentNode = this.rootNode;
		this.slowTransformers.resetAll();
		this.fastTransformers.resetAll();
		this.usedIndices.clear();
		this.futureIndices.clear();
		this.partialMatches.clear();
		this.matches = [];
	}

	private run(breakAfterFirstMatch = false) {
		// Fill the future index buffer by advancing the fast iterator forward.
		while (this.futureIndices.length < this.futureIndices.capacity) {
			const char = this.fastIter.next().value;
			if (char === undefined) {
				// Iterator is done.
				this.futureIndices.push(undefined);
			} else {
				const transformed = this.fastTransformers.applyTo(char);
				// Only add the position if the character didn't become
				// undefined after transformation.
				if (transformed !== undefined) this.futureIndices.push(this.fastIter.position);
			}
		}

		for (const char of this.slowIter) {
			const transformed = this.slowTransformers.applyTo(char);
			if (transformed === undefined) continue;

			// Advance the index window forward.
			// 	1 3 4 5 7 8 9
			// becomes
			// 	3 4 5 7 8 9 10 (if 10 is the current position)
			this.usedIndices.push(this.slowIter.position);

			// Advance the partial matches buffer forward.
			this.partialMatches.push(undefined);

			// Find next usable character for the fast iterator.
			if (this.maxTrailingWildcardCount > 0) {
				let found = false;
				while (!this.fastIter.done && !found) {
					found = this.fastTransformers.applyTo(this.fastIter.next().value!) !== undefined;
					if (found) this.futureIndices.push(this.fastIter.position);
				}
				if (!found) this.futureIndices.push(undefined);
			}

			// Follow failure links until we find a node that has a transition for the current character.
			while (this.currentNode !== this.rootNode && !this.currentNode.edges.get(transformed)) {
				this.currentNode = this.currentNode.failureLink;
			}
			this.currentNode = this.currentNode.edges.get(transformed) ?? this.rootNode;

			// Emit matches for wildcard-only patterns. Patterns of the form
			// ?^N ('?' repeated N times) always have a match ending at the
			// current index if the number of characters seen is
			// >= N.
			for (const data of this.wildcardOnlyPatterns) {
				if (data.wildcardCount > this.usedIndices.length) break;
				const matchLength = this.matchLengths[data.id];
				const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;
				const matched = this.emitMatch(
					data.id,
					data.flags,
					startIndex,
					this.slowIter.position + this.slowIter.lastWidth - 1,
					matchLength,
				);
				if (matched && breakAfterFirstMatch) return true;
			}

			// Emit matches for the current node, then follow its output links.
			if (this.currentNode.flags & NodeFlag.MatchLeaf) {
				const matchLength = this.matchLengths[this.currentNode.termId];
				const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;
				const matched = this.emitMatch(
					this.currentNode.termId,
					this.currentNode.flags,
					startIndex,
					this.slowIter.position + this.slowIter.lastWidth - 1,
					matchLength,
				);
				if (matched && breakAfterFirstMatch) return true;
			}

			if (this.currentNode.flags & NodeFlag.PartialMatchLeaf) {
				for (const partialMatch of this.currentNode.partialMatches!) {
					if (this.emitPartialMatch(partialMatch) && breakAfterFirstMatch) return true;
				}
			}

			let outputLink = this.currentNode.outputLink;
			while (outputLink) {
				if (outputLink.flags & NodeFlag.PartialMatchLeaf) {
					for (const partialMatch of outputLink.partialMatches!) {
						if (this.emitPartialMatch(partialMatch) && breakAfterFirstMatch) return true;
					}
				}

				if (outputLink.flags & NodeFlag.MatchLeaf) {
					const matchLength = this.matchLengths[outputLink.termId];
					const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;
					const matched = this.emitMatch(
						outputLink.termId,
						outputLink.flags,
						startIndex,
						this.slowIter.position + this.slowIter.lastWidth - 1,
						matchLength,
					);
					if (matched && breakAfterFirstMatch) return true;
				}
				outputLink = outputLink.outputLink;
			}
		}

		return this.matches.length > 0;
	}

	private emitPartialMatch(data: PartialMatchData) {
		// ??xxxxx
		// If we have a match for 'xxxxx', the whole pattern matches if the
		// number of characters seen is greater than the number of leading
		// wildcards (in this case 2).
		const hasSufficientCharactersBefore = data.leadingWildcardCount + data.matchLength <= this.usedIndices.length;
		if (!hasSufficientCharactersBefore) return false;

		// 	x x ? ? y y y y y
		// 	0 1 2 3 4 5 5 6 7
		//
		// If we have a match for 'yyyyy', the whole pattern matches if we have
		// a match for 'xx' ending 7 characters before (length of 'yyyyy', plus
		// two wildcards, plus one).
		const hasMatchForPreviousStep =
			// First step has no match before it.
			data.step === 1 ||
			(this.partialMatches
				.get(this.partialMatches.length - data.leadingWildcardCount - data.matchLength - 1)
				?.has(hashPartialMatch(data.step - 1, data.termId)) ??
				false);
		if (!hasMatchForPreviousStep) return false;
		if (data.step === this.partialMatchStepCounts.get(data.termId)) {
			// Say the pattern is 'xx???yyyyy'.
			// We're currently on 'yyyyy' and we know that the steps before
			// match. We can safely emit a match if there are no trailing
			// wildcards.
			if (data.trailingWildcardCount === 0) {
				const matchLength = this.matchLengths[data.termId];
				const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;
				return this.emitMatch(
					data.termId,
					data.flags,
					startIndex,
					this.slowIter.position + this.slowIter.lastWidth - 1,
					matchLength,
				);
			}

			// Say the pattern is 'xx??yy??'.
			// This pattern matches if there are at least two characters that are
			// usable to the right of the current position.
			let endIndex = this.futureIndices.get(data.trailingWildcardCount - 1);
			if (endIndex === undefined) return false;

			// Adjust for surrogate pairs.
			if (
				// not the last character
				endIndex < this.slowIter.input.length - 1 &&
				// character is a high surrogate
				isHighSurrogate(this.slowIter.input.charCodeAt(endIndex)) &&
				// next character is a low surrogate
				isLowSurrogate(this.slowIter.input.charCodeAt(endIndex + 1))
			) {
				endIndex++;
			}

			const matchLength = this.matchLengths[data.termId];
			const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength + data.trailingWildcardCount)!;
			return this.emitMatch(data.termId, data.flags, startIndex, endIndex, matchLength);
		}

		// Otherwise, add a partial match.
		let hashes = this.partialMatches.get(this.partialMatches.length - 1);
		if (!hashes) this.partialMatches.set(this.partialMatches.length - 1, (hashes = new Set<string>()));
		hashes.add(hashPartialMatch(data.step, data.termId));
		return false;
	}

	private emitMatch(id: number, flags: number, startIndex: number, endIndex: number, matchLength: number) {
		const startBoundaryOk =
			!(flags & SharedFlag.RequireWordBoundaryAtStart) || // doesn't require word boundary at the start
			startIndex === 0 || // first character
			!isWordChar(this.slowIter.input.charCodeAt(startIndex - 1)); // character before isn't a word char
		const endBoundaryOk =
			!(flags & SharedFlag.RequireWordBoundaryAtEnd) || // doesn't require word boundary at the end
			endIndex === this.slowIter.input.length - 1 || // last character
			!isWordChar(this.slowIter.input.charCodeAt(endIndex + 1)); // character after isn't a word char
		if (!startBoundaryOk || !endBoundaryOk) return false;

		const termId = this.originalIds[id];
		if (this.whitelistedIntervals.query(startIndex, endIndex)) return false;

		this.matches.push({ termId, matchLength, startIndex, endIndex });
		return true;
	}

	private ensureNoDuplicates(ids: number[]) {
		const seen = new Set<number>();
		for (const id of ids) {
			if (seen.has(id)) throw new Error(`Found duplicate blacklisted term ID ${id}.`);
			seen.add(id);
		}
	}

	private buildTrie(patterns: BlacklistedTerm[]) {
		for (const pattern of patterns) this.registerTerm(pattern);
	}

	private registerTerm(term: BlacklistedTerm) {
		if (term.pattern.nodes.length === 0) throw new Error('Unexpected empty blacklisted term.');

		const simplifiedPatterns = simplify(term.pattern.nodes);
		for (const pattern of simplifiedPatterns) {
			if (pattern.length === 0) {
				throw new Error(
					'Unexpected pattern that matches on the empty string; this is probably due to a pattern comprised of a single optional construct.',
				);
			}

			// Each pattern may actually correspond to several simplified
			// patterns, so use an incrementing numerical ID internally.
			const id = this.currentId++;
			this.originalIds.push(term.id);

			if (pattern.every((node): node is LiteralNode => node.kind === SyntaxKind.Literal)) {
				this.registerPatternWithOnlyLiterals(id, pattern, term);
			} else if (pattern.every((node) => node.kind === SyntaxKind.Wildcard)) {
				this.registerPatternWithOnlyWildcards(id, pattern, term);
			} else {
				this.registerPatternWithWildcardsAndLiterals(id, pattern, term);
			}
		}
	}

	private registerPatternWithOnlyLiterals(id: number, pattern: LiteralNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths[id] = matchLength;
		this.maxMatchLength = Math.max(this.maxMatchLength, matchLength);

		const endNode = this.extendTrie(pattern[0].chars);
		endNode.flags |= NodeFlag.MatchLeaf;
		endNode.termId = id;
		if (term.pattern.requireWordBoundaryAtStart) endNode.flags |= NodeFlag.RequireWordBoundaryAtStart;
		if (term.pattern.requireWordBoundaryAtEnd) endNode.flags |= NodeFlag.RequireWordBoundaryAtEnd;
	}

	private registerPatternWithOnlyWildcards(id: number, pattern: SimpleNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths[id] = matchLength;
		this.maxMatchLength = Math.max(this.maxMatchLength, matchLength);

		const data: WildcardOnlyPatternData = {
			id: id,
			flags: 0,
			wildcardCount: matchLength,
		};
		if (term.pattern.requireWordBoundaryAtStart) data.flags |= WildcardOnlyPatternFlag.RequireWordBoundaryAtStart;
		if (term.pattern.requireWordBoundaryAtEnd) data.flags |= WildcardOnlyPatternFlag.RequireWordBoundaryAtEnd;
		this.wildcardOnlyPatterns.push(data);
	}

	private registerPatternWithWildcardsAndLiterals(id: number, pattern: SimpleNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths[id] = matchLength;
		this.maxMatchLength = Math.max(this.maxMatchLength, matchLength);

		// If a pattern has a wildcard in addition to at least one literal, we
		// will split the pattern at its wildcards, resulting in a number of
		// partial patterns. For example, given 'l1 w1 l2 w2' where l1, l2 are
		// literals and w1, w2 are wildcards, we would have 2 partial patterns:
		// l1 and l2.
		//
		// We will then assign each partial pattern a step: l1 would be tep 1
		// and l2 step 2. Then, we will extend the trie with l1 and l2. After
		// that is done, we will decorate the leaf nodes at the leaf nodes of
		// each pattern with some additional metadata to indicate that they are
		// the leaf node of a partial match.
		//
		// So how does this help us match wildcards?
		//
		// Let's say that we find the pattern l1 in the text. Since it is the
		// first step, we will hash it and add it to the set of partial matches
		// ending at that position. Now, let's say that we find pattern l2 in
		// the text. We can combine the partial matches l1 and l2 iff l1 was
		// found in the text 1 position before the start position of where l2
		// matched. (1 is the number of wildcards separating l1 and l2 in the
		// original pattern).
		//
		// Since l2 is the last partial pattern, we add it to a stack of pending
		// partial matches. (Note that if there was no wildcard after l2, we
		// could emit it immediately. However, as there are wildcards after l2,
		// we have to wait until we are sure that we have an adequate number of
		// characters to satisfy the required number of wildcards).
		const groups = groupByNodeType(pattern);
		let step = 1;

		const startsWithLiteral = groups[0].isLiteralGroup;
		for (let i = startsWithLiteral ? 0 : 1; i < groups.length; i += 2, step++) {
			// Count the number of trailing and leading wildcards
			// before/after the current literal segment.
			const lastLiteralGroupLength =
				i < 2 ? 0 : (groups[i - 2] as LiteralGroup).literals.reduce((a, b) => a + b.chars.length, 0);
			const leadingWildcardCount = i === 0 ? 0 : (groups[i - 1] as WildcardGroup).wildcardCount;
			const trailingWildcardCount = i === groups.length - 1 ? 0 : (groups[i + 1] as WildcardGroup).wildcardCount;

			// Extend the trie with the characters of the literal.
			const chars = (groups[i] as LiteralGroup).literals.flatMap((node) => node.chars);
			const endNode = this.extendTrie(chars);

			// Add some additional metadata to the leaf node.
			const data: PartialMatchData = {
				step,
				termId: id,
				flags: 0,
				leadingWildcardCount,
				trailingWildcardCount,
				matchLength: chars.length,
			};
			if (term.pattern.requireWordBoundaryAtStart) data.flags |= PartialMatchFlag.RequireWordBoundaryAtStart;
			if (term.pattern.requireWordBoundaryAtEnd) data.flags |= PartialMatchFlag.RequireWordBoundaryAtEnd;
			(endNode.partialMatches ??= []).push(data);
			endNode.flags |= NodeFlag.PartialMatchLeaf;

			this.maxPartialPatternDistance = Math.max(
				this.maxPartialPatternDistance,
				lastLiteralGroupLength + leadingWildcardCount + chars.length,
			);
			if (i >= groups.length - 2) {
				// Last group of literals.
				this.maxTrailingWildcardCount = Math.max(this.maxTrailingWildcardCount, trailingWildcardCount);
			}
		}

		this.partialMatchStepCounts.set(id, step - 1);
	}

	private extendTrie(chars: number[]) {
		let currentNode = this.rootNode;
		for (const char of chars) {
			const nextNode = currentNode.edges.get(char);
			if (nextNode) {
				currentNode = nextNode;
			} else {
				const newNode = new BlacklistTrieNode();
				currentNode.edges.set(char, newNode);
				currentNode = newNode;
			}
		}

		return currentNode;
	}

	private constructLinks() {
		// Compute the failure and output functions for the trie. This
		// implementation is fairly straightforward and is essentially the exact
		// same as that detailed in Aho and Corasick's original paper. Refer to
		// section 3 in said paper for more details.
		this.rootNode.failureLink = this.rootNode;
		const queue = new Queue<BlacklistTrieNode>();
		for (const node of this.rootNode.edges.values()) {
			node.failureLink = this.rootNode;
			queue.push(node);
		}

		while (queue.length > 0) {
			const node = queue.shift()!;
			for (const [char, childNode] of node.edges) {
				let cur = node.failureLink;
				while (!cur.edges.get(char) && cur !== this.rootNode) cur = cur.failureLink;

				const failureLink = cur.edges.get(char) ?? this.rootNode;
				childNode.failureLink = failureLink;
				queue.push(childNode);
			}

			node.outputLink =
				node.failureLink.flags & NodeFlag.MatchLeaf || node.failureLink.flags & NodeFlag.PartialMatchLeaf
					? node.failureLink
					: node.failureLink.outputLink;
		}
	}

	private useUnderlyingEdgeCollectionImplementation(node: BlacklistTrieNode) {
		node.edges = (node.edges as ForwardingEdgeCollection<BlacklistTrieNode>).underlyingImplementation;
		for (const childNode of node.edges.values()) this.useUnderlyingEdgeCollectionImplementation(childNode);
	}
}

/**
 * Options for the [[NfaMatcher]].
 */
export interface NfaMatcherOptions {
	/**
	 * A list of blacklisted terms.
	 */
	blacklistedTerms: BlacklistedTerm[];

	/**
	 * A list of whitelisted terms. If a whitelisted term matches some part of
	 * the text, a match of a blacklisted pattern within that part of the text
	 * will not be emitted.
	 *
	 * For example, if we had a pattern `penis` and a whitelisted term `pen is`,
	 * only no matches would be reported for the input text `the pen is mightier
	 * than the sword.`
	 *
	 * @default []
	 */
	whitelistedTerms?: string[];

	/**
	 * A set of transformers that should be applied to the input text before
	 * blacklisted patterns are matched. This does not affect the matching of
	 * whitelisted terms.
	 *
	 * Transformers will be applied in the order they appear.
	 *
	 * @default []
	 */
	blacklistMatcherTransformers?: TransformerContainer[];

	/**
	 * A set of transformers that should be applied to the input text before
	 * whitelisted terms are matched. This does not affect the matching of
	 * blacklisted terms.
	 *
	 * Transformers will be applied in the order they appear.
	 *
	 * @default []
	 */
	whitelistMatcherTransformers?: TransformerContainer[];
}

interface WildcardOnlyPatternData {
	id: number;
	flags: number;
	wildcardCount: number;
}

const enum WildcardOnlyPatternFlag {
	RequireWordBoundaryAtStart = 1 << 0,
	RequireWordBoundaryAtEnd = 1 << 1,
}
