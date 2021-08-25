import type { LiteralNode } from '../pattern/Nodes';
import { SyntaxKind } from '../pattern/Nodes';
import type { SimpleNode } from '../pattern/Simplifier';
import { simplify } from '../pattern/Simplifier';
import type { LiteralGroup, WildcardGroup } from '../pattern/Util';
import { computePatternMatchLength, groupByNodeType } from '../pattern/Util';
import type { TransformerContainer } from '../transformer/Transformers';
import { TransformerSet } from '../transformer/TransformerSet';
import { isWordChar } from '../util/Char';
import { CharacterIterator } from '../util/CharacterIterator';
import { CircularBuffer } from '../util/CircularBuffer';
import { Queue } from '../util/Queue';
import type { BlacklistedTerm } from './BlacklistedTerm';
import { IntervalCollection } from './IntervalCollection';
import type { MatchPayload } from './MatchPayload';
import { compareMatchByPositionAndId } from './MatchPayload';
import type { PartialMatchData } from './trie/BlacklistTrieNode';
import { BlacklistTrieNode, hashPartialMatch, NodeFlag, PartialMatchFlag, SharedFlag } from './trie/BlacklistTrieNode';
import type { ForwardingEdgeCollection } from './trie/edge/ForwardingEdgeCollection';
import { WhitelistedTermMatcher } from './WhitelistedTermMatcher';

/**
 * Matches patterns on text, ignoring parts of the text that are matched by
 * whitelisted terms.
 */
export class PatternMatcher {
	private readonly rootNode = new BlacklistTrieNode();
	private readonly patternIdMap = new Map<number, number>(); // generated ID -> original pattern ID
	private readonly matchLengths = new Map<number, number>(); // pattern ID -> match length
	private readonly partialMatchStepCounts = new Map<number, number>(); // pattern ID -> number of partial match steps
	private readonly wildcardOnlyPatterns = new Map<number, WildcardOnlyPatternData>(); // key is match length
	private readonly wildcardOnlyPatternMatchLengths: number[] = [];
	private maxMatchLength = 0;
	private currentId = 0;

	private readonly whitelistedTermMatcher: WhitelistedTermMatcher;
	private readonly transformers: TransformerSet;

	private readonly iter = new CharacterIterator();
	private readonly usedIndices: CircularBuffer<number>; // tracks indices used for matching so we can get the start index of a match
	private matches: MatchPayload[] = [];
	private readonly pendingPartialMatches: PendingPartialMatch[] = []; // pending partial matches that are waiting for their required wildcard count to be fulfilled
	private readonly partialMatches: CircularBuffer<Set<string> | undefined>; // partial matches found; value is a set of partial match hashes
	private currentNode = this.rootNode;
	private whitelistedIntervals = new IntervalCollection();

	/**
	 * Creates a new pattern matcher with the options given.
	 *
	 * @example
	 * ```typescript
	 * // Simple matcher that only has blacklisted patterns.
	 * const matcher = new PatternMatcher({
	 * 	blacklistedTerms: assignIncrementingIds([
	 * 		pattern`fuck`,
	 * 		pattern`f?uck`, // wildcards (?)
	 * 		pattern`bitch`,
	 * 		pattern`b[i]tch` // optionals ([i] matches either "i" or "")
	 * 	]),
	 * });
	 *
	 * // Check whether some string matches any of the patterns.
	 * const doesMatch = matcher.hasMatch('fuck you bitch');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // A more advanced example, with transformers and whitelisted terms.
	 * const matcher = new PatternMatcher({
	 * 	blacklistedTerms: [
	 * 		{ id: 1, pattern: pattern`penis` },
	 * 		{ id: 2, pattern: pattern`fuck` },
	 * 	],
	 * 	whitelistedTerms: ['pen is'],
	 * 	blacklistMatcherTransformers: [
	 * 		resolveConfusablesTransformer(), // '🅰' => 'a'
	 * 		resolveLeetSpeakTransformer(), // '$' => 's'
	 * 		foldAsciiCharCaseTransformer(), // case insensitive matching
	 * 		collapseDuplicatesTransformer(), // 'aaaa' => 'a'
	 * 		skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
	 * 	],
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
	}: PatternMatcherOptions) {
		this.whitelistedTermMatcher = new WhitelistedTermMatcher({
			terms: whitelistedTerms,
			transformers: whitelistMatcherTransformers,
		});
		this.transformers = new TransformerSet(blacklistMatcherTransformers);
		this.ensureNoDuplicates(blacklistedTerms.map((p) => p.id));
		this.buildTrie(blacklistedTerms);
		this.constructLinks();
		this.useUnderlyingEdgeCollectionImplementation(this.rootNode);
		this.wildcardOnlyPatternMatchLengths = [...new Set(this.wildcardOnlyPatternMatchLengths)].sort(); // deduplicate, then sort in ascending order
		this.usedIndices = new CircularBuffer(this.maxMatchLength);
		this.partialMatches = new CircularBuffer(this.maxMatchLength);
	}

	/**
	 * Returns all matches of the matcher on the text.
	 *
	 * If you only need to check for the presence of a match, and have no use
	 * for more specific information about the matches, use the `hasMatch()`
	 * method, which is more efficient.
	 *
	 * @param input - Text to find profanities in.
	 *
	 * @param sorted - Whether the resulting list of matches should be sorted
	 * using [[compareMatchByPositionAndId]]. Defaults to `false`.
	 *
	 * @returns A list of matches of the matcher on the text. The matches are
	 * guaranteed to be sorted if and only if the `sorted` parameter is `true`,
	 * otherwise, their order is unspecified.
	 */
	public getAllMatches(input: string, sorted = false) {
		this.setInput(input);
		this.run();
		if (sorted) this.matches.sort(compareMatchByPositionAndId);
		return this.matches;
	}

	/**
	 * Checks whether the matcher matches on the text.
	 *
	 * This is more efficient than calling `getAllMatches` and checking the result,
	 * as it stops once it finds a match.
	 *
	 * @param input - Text to check.
	 */
	public hasMatch(input: string) {
		this.setInput(input);
		const hasMatch = this.run(true);
		return hasMatch;
	}

	private setInput(input: string) {
		this.iter.setInput(input);
		this.whitelistedIntervals = this.whitelistedTermMatcher.getMatches(this.input);
		this.iter.reset();
		this.currentNode = this.rootNode;
		this.usedIndices.clear();
		this.partialMatches.clear();
		this.matches = [];
	}

	private run(breakAfterFirstMatch = false) {
		for (const char of this.iter) {
			const transformed = this.transformers.applyTo(char);
			if (transformed === undefined) continue; // Returning undefined from a transformer skips that character.

			// Mark the current position as one used for matching.
			this.usedIndices.push(this.position);
			// Move the partial matches buffer forward.
			this.partialMatches.push(undefined);

			// Follow failure links until we find a node that has a transition for the current character.
			while (this.currentNode !== this.rootNode && !this.currentNode.edges.get(transformed)) {
				this.currentNode = this.currentNode.failureLink;
			}
			this.currentNode = this.currentNode.edges.get(transformed) ?? this.rootNode;

			// Relax the trailing wildcard counts of pending partial matches.
			for (let i = this.pendingPartialMatches.length - 1; i >= 0; i--) {
				const match = this.pendingPartialMatches[i];
				// Have we seen enough characters to conclude that the wildcard
				// requirement for this match has been fulfilled?
				//
				// Example: Let's say we are matching the pattern 'aa??'. After
				// we match the partial pattern 'aa', we need to see 2 more
				// characters before we can conclude that the whole pattern
				// matched.
				if (--match.trailingWildcardCount === 0) {
					if (this.emitMatch(match.id, match.flags) && breakAfterFirstMatch) return true;

					// Set the value at the current index to the last pending
					// match, then pop from the array. This allows us to remove
					// the value at the current index in amortized constant time
					// and is only possible because we don't care about the
					// order of the array.
					this.pendingPartialMatches[i] = this.pendingPartialMatches[this.pendingPartialMatches.length - 1];
					this.pendingPartialMatches.pop();
				}
			}

			// Emit matches for wildcard-only patterns. Patterns of the form
			// '????' ('?' repeated N times) always have a match ending at the
			// current index if the number of characters seen is
			// >= N.
			for (const matchLength of this.wildcardOnlyPatternMatchLengths) {
				if (matchLength > this.usedIndices.length) break;
				const pattern = this.wildcardOnlyPatterns.get(matchLength)!;
				if (this.emitMatch(pattern.id, pattern.flags) && breakAfterFirstMatch) return true;
			}

			// Emit matches for the current node, then follow its output links.
			if (this.currentNode.flags & NodeFlag.MatchLeaf) {
				if (this.emitMatch(this.currentNode.termId, this.currentNode.flags) && breakAfterFirstMatch) return true;
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
					if (this.emitMatch(outputLink.termId, outputLink.flags) && breakAfterFirstMatch) return true;
				}
				outputLink = outputLink.outputLink;
			}
		}

		return this.matches.length > 0;
	}

	private get input() {
		return this.iter.input;
	}

	private get position() {
		return this.iter.position;
	}

	private emitPartialMatch(data: PartialMatchData) {
		const hasSufficientCharactersBefore = data.leadingWildcardCount + data.matchLength <= this.position + 1;
		const hasMatchForPreviousStep =
			data.step === 1 ||
			(this.partialMatches
				.get(this.partialMatches.length - data.leadingWildcardCount - data.matchLength - 1)
				?.has(hashPartialMatch(data.step - 1, data.termId)) ??
				false);
		if (!hasSufficientCharactersBefore || !hasMatchForPreviousStep) return false;
		if (data.step === this.partialMatchStepCounts.get(data.termId)) {
			// We're on the last step: see if we can emit a match for the whole
			// pattern, or add it to our pending matches.
			if (data.trailingWildcardCount === 0) return this.emitMatch(data.termId, data.flags);

			// Otherwise, add it to the stack of maybe pending partial matches.
			this.pendingPartialMatches.push({
				trailingWildcardCount: data.trailingWildcardCount,
				id: data.termId,
				flags: data.flags,
			});
		} else {
			let hashes = this.partialMatches.get(this.partialMatches.length - 1);
			if (!hashes) this.partialMatches.set(this.partialMatches.length - 1, (hashes = new Set<string>()));
			hashes.add(hashPartialMatch(data.step, data.termId));
		}

		return false;
	}

	private emitMatch(id: number, flags: number) {
		// Adjust the position to point to the low surrogate if the last character we saw was a surrogate pair.
		const endIndex = this.position + this.iter.lastWidth - 1;
		const matchLength = this.matchLengths.get(id)!;
		const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;
		const startBoundaryOk =
			!(flags & SharedFlag.RequireWordBoundaryAtStart) || // doesn't require word boundary at the start
			startIndex === 0 || // first character
			!isWordChar(this.input.charCodeAt(startIndex - 1)); // character before isn't a word char
		const endBoundaryOk =
			!(flags & SharedFlag.RequireWordBoundaryAtEnd) || // doesn't require word boundary at the end
			endIndex === this.input.length - 1 || // last character
			!isWordChar(this.input.charCodeAt(endIndex + 1)); // character after isn't a word char
		if (!startBoundaryOk || !endBoundaryOk) return false;

		const patternId = this.patternIdMap.get(id)!;
		if (this.whitelistedIntervals.query(startIndex, endIndex)) return false;

		this.matches.push({ termId: patternId, matchLength, startIndex, endIndex });
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
			const generatedId = this.currentId++;
			this.patternIdMap.set(generatedId, term.id);

			if (pattern.every((node): node is LiteralNode => node.kind === SyntaxKind.Literal)) {
				this.registerPatternWithOnlyLiterals(generatedId, pattern, term);
			} else if (pattern.every((node) => node.kind === SyntaxKind.Wildcard)) {
				this.registerPatternWithOnlyWildcards(generatedId, pattern, term);
			} else {
				this.registerPatternWithWildcardsAndLiterals(generatedId, pattern, term);
			}
		}
	}

	private registerPatternWithOnlyLiterals(id: number, pattern: LiteralNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths.set(id, matchLength);
		this.maxMatchLength = Math.max(this.maxMatchLength, matchLength);

		const endNode = this.extendTrie(pattern[0].chars);
		endNode.flags |= NodeFlag.MatchLeaf;
		endNode.termId = id;
		if (term.pattern.requireWordBoundaryAtStart) endNode.flags |= NodeFlag.RequireWordBoundaryAtStart;
		if (term.pattern.requireWordBoundaryAtEnd) endNode.flags |= NodeFlag.RequireWordBoundaryAtEnd;
	}

	private registerPatternWithOnlyWildcards(id: number, pattern: SimpleNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths.set(id, matchLength);
		this.maxMatchLength = Math.max(this.maxMatchLength, matchLength);
		this.wildcardOnlyPatternMatchLengths.push(matchLength);

		const data: WildcardOnlyPatternData = {
			id: id,
			flags: 0,
		};
		if (term.pattern.requireWordBoundaryAtStart) data.flags |= WildcardOnlyPatternFlag.RequireWordBoundaryAtStart;
		if (term.pattern.requireWordBoundaryAtEnd) data.flags |= WildcardOnlyPatternFlag.RequireWordBoundaryAtEnd;
		this.wildcardOnlyPatterns.set(matchLength, data);
	}

	private registerPatternWithWildcardsAndLiterals(id: number, pattern: SimpleNode[], term: BlacklistedTerm) {
		const matchLength = computePatternMatchLength(pattern);
		this.matchLengths.set(id, matchLength);
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
 * Options for the [[PatternMatcher]].
 */
export interface PatternMatcherOptions {
	/**
	 * A list of blacklisted terms.
	 *
	 * **User-supplied patterns**
	 *
	 * Allowing user-supplied patterns is potentially dangerous and frowned
	 * upon, but should in theory be safe if the number of optional nodes that
	 * are permitted in patterns is limited to prevent pattern expansion from
	 * resulting in an unacceptable number of variants.
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
}

const enum WildcardOnlyPatternFlag {
	RequireWordBoundaryAtStart = 1 << 0,
	RequireWordBoundaryAtEnd = 1 << 1,
}

interface PendingPartialMatch {
	id: number;
	flags: number;
	trailingWildcardCount: number;
}
