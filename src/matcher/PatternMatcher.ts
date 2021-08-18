import { simplify } from '../pattern/Simplifier';
import { LiteralNode, SyntaxKind } from '../pattern/Nodes';
import { TransformerSet } from '../transformer/TransformerSet';
import { TransformerContainer } from '../transformer/Transformers';
import {
	SharedFlag,
	BlacklistTrieNode,
	BlacklistTrieNodeFlag,
	LinkedFragmentFlag,
	ForkedTraversalMetadata,
} from './trie/BlacklistTrieNode';
import { BlacklistedTerm } from './BlacklistedTerm';
import { MatchPayload } from './MatchPayload';
import { WhitelistedTermMatcher } from './WhitelistedTermMatcher';
import { Queue } from '../util/Queue';
import { CharacterIterator } from '../util/CharacterIterator';
import { CircularBuffer } from '../util/CircularBuffer';
import { computePatternMatchLength } from '../pattern/ComputeMatchLength';
import { ForkedTraversal, ForkedTraversalResponse } from './ForkedTraversal';
import { isWordBoundary } from '../util/Char';
import { IntervalCollection } from './interval/IntervalCollection';
import { ForkedTraversalLimitExceededError } from './ForkedTraversalLimitExceededError';

/**
 * Matches patterns on text, optionally ignoring portions of the text that are
 * matched by whitelisted terms.
 */
export class PatternMatcher implements IterableIterator<MatchPayload> {
	private forkedTraversalLimit = 0;

	private readonly rootNode = new BlacklistTrieNode();
	private readonly patternIdMap = new Map<number, number>(); // generated ID -> original pattern ID
	private readonly matchLengths = new Map<number, number>(); // pattern ID -> match length
	private maxMatchLength = 0;
	private currentId = 0;

	private readonly whitelistedTermMatcher: WhitelistedTermMatcher;
	private readonly transformers: TransformerSet;

	private readonly iter = new CharacterIterator();
	private readonly forkedTraversals: ForkedTraversal[] = [];
	private readonly usedIndices: CircularBuffer<number>; // tracks indices used for matching; see comment in whitelist/WhitelistedTermMatcher.ts for why this exists
	private readonly pendingMatches: MatchPayload[] = []; // pending matches that need to be emitted
	private currentNode = this.rootNode;
	private whitelistedSpans = new IntervalCollection();

	/**
	 * Creates a new pattern matcher with the options given.
	 *
	 * @example
	 * ```typescript
	 * // Simple matcher that only has blacklisted patterns.
	 * const matcher = new PatternMatcher({
	 * 	// Patterns require IDs, but in this example we won't worry
	 * 	// about them. Instead, we will use the assignIncrementingIds()
	 * 	// utility to auto-assign unique IDs to our patterns.
	 * 	// For more information about the pattern syntax, refer to
	 * 	// the documentation for the pattern`` template tag.
	 * 	blacklistedPatterns: assignIncrementingIds([
	 * 		pattern`fuck`,
	 * 		pattern`f?uck`, // wildcards (?)
	 * 		pattern`bitch`,
	 * 		pattern`b[i]tch` // optionals ([i] matches either "i" or "")
	 * 	]),
	 * });
	 *
	 * // Check whether some string matches any of the patterns.
	 * const doesMatch = matcher.setInput('fuck you bitch').hasMatch();
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // A more advanced example, with transformers and whitelisted terms.
	 * const matcher = new PatternMatcher({
	 * 	blacklistedPatterns: [
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
	 * console.log(matcher
	 * 	.setInput('fu.....uuuuCK the pen is mightier than the sword!')
	 * 	.getAllMatches());
	 * ```
	 *
	 * @param options - Options to use.
	 */
	public constructor({
		forkedTraversalLimit = 50,
		blacklistedPatterns,
		whitelistedTerms = [],
		blacklistMatcherTransformers = [],
		whitelistMatcherTransformers = [],
	}: PatternMatcherOptions) {
		this.forkedTraversalLimit = forkedTraversalLimit;
		this.whitelistedTermMatcher = new WhitelistedTermMatcher({
			terms: whitelistedTerms,
			transformers: whitelistMatcherTransformers,
		});
		this.transformers = new TransformerSet(blacklistMatcherTransformers);
		this.ensureNoDuplicates(blacklistedPatterns.map((p) => p.id));
		this.buildTrie(blacklistedPatterns);
		this.usedIndices = new CircularBuffer(this.maxMatchLength);
		this.constructLinks();
	}

	/**
	 * Sets the input of the pattern matcher, resetting it in the process.
	 *
	 * @param input - Input string to match against.
	 */
	public setInput(input: string) {
		this.iter.setInput(input.normalize());
		this.whitelistedSpans = this.whitelistedTermMatcher.getMatchedSpans(this.input);
		this.reset();
		return this;
	}

	/**
	 * Resets the state of the pattern matcher. Calling this method on a pattern
	 * matcher with some input `input` has the same effect as writing
	 * `matcher.setInput(input)`.
	 */
	public reset() {
		this.iter.reset();
		this.currentNode = this.rootNode;
		this.forkedTraversals.splice(0);
		this.usedIndices.clear();
		this.pendingMatches.splice(0);
	}

	/**
	 * Returns all matches of the matcher on the text, resetting it afterward.
	 * This is the most computationally expensive method, as it needs to process
	 * the whole text. With that said, if you:
	 * - only need the first match, use `getFirstMatch()`;
	 * - only need to check whether there is a match, use `hasMatch()`.
	 *
	 * @returns A list of matches of the matcher on the text.
	 * @throws [[ForkedTraversalLimitedExceededError]] if, in the process of matching
	 * on the text, the number of forked traversals spawned was exceeded. To increase
	 * the limit, see `forkedTraversalLimit` in the matcher options.
	 */
	public getAllMatches() {
		const result = [...this];
		this.reset();
		return result;
	}

	/**
	 * Results the first match of the matcher on the text, resetting the matcher afterward.
	 * This is more efficient than calling `getAllMatches` and checking the result, but
	 * is no more efficient than `hasMatch`, as both methods stop once they find a match.
	 *
	 * @returns The first match of the matcher on the text, or `undefined` if none.
	 * @throws [[ForkedTraversalLimitedExceededError]] if, in the process of matching
	 * on the text, the number of forked traversals spawned was exceeded. To increase
	 * the limit, see `forkedTraversalLimit` in the matcher options.
	 */
	public getFirstMatch() {
		const result = this.next();
		this.reset();
		return result.value;
	}

	/**
	 * Checks whether the matcher matches on the text, resetting the matcher afterward.
	 * This is more efficient than calling `getAllMatches` and checking the result,
	 * as it stops once it finds a match.
	 *
	 * @returns Whether the matcher matches on the text.
	 * @throws [[ForkedTraversalLimitedExceededError]] if, in the process of matching
	 * on the text, the number of forked traversals spawned was exceeded. To increase
	 * the limit, see `forkedTraversalLimit` in the matcher options.
	 */
	public hasMatch() {
		const result = this.next();
		this.reset();
		return !result.done!;
	}

	/**
	 * Advances the position of the matcher until a match is found or if the EOF
	 * is hit.
	 *
	 * @returns An iterator result of the first match found after the current position.
	 * @throws [[ForkedTraversalLimitedExceededError]] if, in the process of matching
	 * on the text, the number of forked traversals spawned was exceeded. To increase
	 * the limit, see `forkedTraversalLimit` in the matcher options.
	 */
	public next(): IteratorResult<MatchPayload, undefined> {
		if (this.done) return { done: true, value: undefined };
		if (this.hasPendingMatches) return { done: false, value: this.pendingMatches.pop()! };

		while (!this.done && !this.hasPendingMatches) {
			const transformed = this.transformers.applyTo(this.iter.next().value!);
			if (!transformed) continue; // Returning undefined from a transformer skips that character.

			// Mark the current position as one used for matching.
			this.usedIndices.push(this.position);

			// Spawn forked traversals off of the current node.
			const spawned = new Set<number>();
			if (this.currentNode.flags & BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly) {
				for (const metadata of this.currentNode.forkedTraversals!) {
					spawned.add(metadata.patternId);
					this.spawnForkedTraversal(metadata);
				}
			}

			// Follow forked traversal links.
			let forkedTraversalLink = this.currentNode.forkedTraversalLink;
			while (forkedTraversalLink) {
				if (!(forkedTraversalLink.flags & BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly)) {
					// Path compression should make sure that the forked
					// traversal links of a node spawn forked traversals
					// directly.
					throw new Error('Forked traversal link does not spawn forked traversals directly; this should never happen.');
				}

				for (const metadata of forkedTraversalLink.forkedTraversals!) {
					if (!spawned.has(metadata.patternId)) {
						this.spawnForkedTraversal(metadata);
						spawned.add(metadata.patternId);
					}
				}

				forkedTraversalLink = forkedTraversalLink.forkedTraversalLink;
			}

			// Consume the current character on all forked traversals.
			for (let i = this.forkedTraversals.length - 1; i >= 0; i--) {
				const fork = this.forkedTraversals[i];
				switch (fork.consume(transformed)) {
					case ForkedTraversalResponse.Pong:
						// do nothing
						break;
					case ForkedTraversalResponse.FoundMatch:
						this.emitMatch(fork.metadata.patternId, fork.metadata.flags); // fall through
					case ForkedTraversalResponse.Destroy:
						// swap the current element with the last element of the
						// array, then pop the stack.
						this.forkedTraversals[i] = this.forkedTraversals[this.forkedTraversals.length - 1];
						this.forkedTraversals.pop();
						break;
				}
			}

			// Follow failure links until we find a node that has a transition for the current character.
			while (this.currentNode !== this.rootNode && !this.currentNode.edges.get(transformed)) {
				this.currentNode = this.currentNode.failureLink;
			}
			this.currentNode = this.currentNode.edges.get(transformed) ?? this.rootNode;

			// Emit matches as necessary.
			if (this.currentNode.flags & BlacklistTrieNodeFlag.IsOutputNode) {
				this.emitMatch(this.currentNode.termId, this.currentNode.flags);
			}

			// Follow output links.
			let outputLink = this.currentNode.outputLink;
			while (outputLink) {
				this.emitMatch(outputLink.termId, outputLink.flags);
				outputLink = outputLink.outputLink;
			}
		}

		if (this.hasPendingMatches) return { done: false, value: this.pendingMatches.pop()! };
		return { done: true, value: undefined };
	}

	/**
	 * Implements the iterator protocol for the pattern matcher.
	 */
	public [Symbol.iterator]() {
		return this;
	}

	/**
	 * The input that is currently being matched on.
	 */
	public get input() {
		return this.iter.input;
	}

	/**
	 * The current position of the matcher.
	 * If nothing has been matched yet, the position is `-1`.
	 */
	public get position() {
		return this.iter.position;
	}

	/**
	 * Whether the matcher is done with the input.
	 */
	public get done() {
		return this.iter.done && !this.hasPendingMatches;
	}

	private get hasPendingMatches() {
		return this.pendingMatches.length > 0;
	}

	private spawnForkedTraversal(data: ForkedTraversalMetadata) {
		// We can skip spawning a forked traversal if it requires a word
		// boundary at the start, but there is no such word boundary.
		if (
			!(data.flags & LinkedFragmentFlag.RequireWordBoundaryAtStart) ||
			!isWordBoundary(this.usedIndices.get(this.usedIndices.length - data.preFragmentMatchLength)!, this.input)
		) {
			this.forkedTraversals.push(new ForkedTraversal(data));
		}

		if (this.forkedTraversals.length > this.forkedTraversalLimit) {
			throw new ForkedTraversalLimitExceededError(
				this.input,
				this.position,
				this.patternIdMap.size,
				this.forkedTraversalLimit,
			);
		}
	}

	private emitMatch(id: number, flags: number) {
		let endIndex = this.usedIndices.get(this.usedIndices.length - 1)!;
		if (this.iter.lastWidth === 2) {
			// If the last character was a surrogate pair, adjust the end index.
			endIndex++;
		}

		const matchLength = this.matchLengths.get(id)!;
		// See comment in WhitelistedTermMatcher.ts for more information about
		// how start indices are computed.
		const startIndex = this.usedIndices.get(this.usedIndices.length - matchLength)!;

		const startBoundaryOk = !(flags & SharedFlag.RequireWordBoundaryAtStart) || isWordBoundary(startIndex, this.input);
		const endBoundaryOk = !(flags & SharedFlag.RequireWordBoundaryAtEnd) || isWordBoundary(endIndex, this.input);
		if (!startBoundaryOk || !endBoundaryOk) return;

		const patternId = this.patternIdMap.get(id)!;
		if (this.whitelistedSpans.fullyContains([startIndex, endIndex])) return;

		this.pendingMatches.push({ termId: patternId, matchLength, startIndex, endIndex });
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
		if (term.pattern.nodes.length === 0) {
			throw new Error('Unexpected empty blacklisted term.');
		}

		const simplifiedPatterns = simplify(term.pattern.nodes);
		for (const pattern of simplifiedPatterns) {
			if (pattern.length === 0) {
				throw new Error(
					'Unexpected pattern that matches on the empty string; this is probably due to a pattern comprised of a single optional construct.',
				);
			}

			// Each pattern may actually correspond to several simplified
			// patterns, so use an incrementing numerical ID internally.
			// We can get the original pattern ID back by indexing into patternIdMap.
			const uniqueId = this.currentId++;
			this.patternIdMap.set(uniqueId, term.id);

			// Track the match length of this pattern.
			const matchLength = computePatternMatchLength(pattern);
			this.matchLengths.set(uniqueId, matchLength);
			if (matchLength > this.maxMatchLength) this.maxMatchLength = matchLength;

			const wildcardIndex = pattern.findIndex((t) => t.kind === SyntaxKind.Wildcard);

			/* istanbul ignore if: hitting this branch should technically be impossible, for reasons detailed in the comment below. */
			if (wildcardIndex > 1) {
				// Simplifying the pattern should also result in literal nodes being merged.
				// Thus, the index of the wildcard should be one of:
				// 	-1: does not exist
				//  0: exists, and is the first node
				//  1: exists, and is after some text
				//
				// It should never be, for example, 2, as that would imply that
				// there are two literal nodes before it which is impossible as
				// they should've been merged.
				throw new Error('Text node runs were not merged properly; this should never happen.');
			}

			if (wildcardIndex === -1) {
				// No wildcard node; the pattern is all text.
				const endNode = this.extendTrie((pattern[0] as LiteralNode).chars);
				endNode.flags |= BlacklistTrieNodeFlag.IsOutputNode;
				endNode.termId = uniqueId;
				if (term.pattern.requireWordBoundaryAtStart) endNode.flags |= BlacklistTrieNodeFlag.RequireWordBoundaryAtStart;
				if (term.pattern.requireWordBoundaryAtEnd) endNode.flags |= BlacklistTrieNodeFlag.RequireWordBoundaryAtEnd;
			} else {
				// Extend the trie with the text of the literal before the wildcard, if it exists.
				// Then, add the remaining nodes to the linked fragments of the resulting trie node.
				const hasLiteralBeforeWildcard = wildcardIndex === 1;
				const endNode = hasLiteralBeforeWildcard ? this.extendTrie((pattern[0] as LiteralNode).chars) : this.rootNode;
				const metadata: ForkedTraversalMetadata = {
					patternId: uniqueId,
					preFragmentMatchLength: hasLiteralBeforeWildcard ? (pattern[0] as LiteralNode).chars.length : 0,
					flags: 0,
					nodes: pattern.slice(wildcardIndex),
				};

				if (term.pattern.requireWordBoundaryAtStart) metadata.flags |= LinkedFragmentFlag.RequireWordBoundaryAtStart;
				if (term.pattern.requireWordBoundaryAtEnd) metadata.flags |= LinkedFragmentFlag.RequireWordBoundaryAtEnd;
				(endNode.forkedTraversals ??= []).push(metadata);
				endNode.flags |= BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly;
			}
		}
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
		// Compute the failure and output functions for the trie.
		// This implementation is fairly straightforward except for one
		// modification we make to merge linked fragments; see the comment below.
		// Otherwise, it is essentially the exact same as that detailed in Aho
		// and Corasick's original paper.
		// Refer to section 3 in said paper for more details.
		this.rootNode.failureLink = this.rootNode;
		const queue = new Queue<BlacklistTrieNode>();
		for (const node of this.rootNode.edges.nodes()) {
			node.failureLink = this.rootNode;
			// See the long comment below.
			if (this.rootNode.flags & BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly) {
				node.forkedTraversalLink = this.rootNode;
			}
			queue.push(node);
		}

		while (queue.length > 0) {
			const node = queue.shift()!;
			for (const [char, childNode] of node.edges) {
				let cur = node.failureLink;
				while (!cur.edges.get(char) && cur !== this.rootNode) cur = cur.failureLink;

				const failureLink = cur.edges.get(char);
				if (failureLink) {
					// Recall that patterns with wildcard nodes are not
					// completely stored in the trie. Instead, we add the
					// literal nodes up to the first wildcard node and then add
					// the remaining nodes to the linked fragments of the
					// resulting trie node.
					//
					// How should this construct interact with failure links?
					// Consider a set of patterns P = {'abcd', 'bcd', 'c?'}. The
					// failure link at the trie nodes corresponding to the
					// character 'c' in the first pattern points to the second,
					// and similar for the second. If we have a match for
					// 'abcd', 'bcd' should also match, as should 'c?'. However,
					// without further changes to the original failure/output
					// function construction algorithms, a match for the third
					// pattern would not be emitted.
					//
					// To make the above example work, we need to spawn a forked
					// traversal whenever we see the character 'c'. More
					// generally, given a pattern with a wildcard node w 'xwy'
					// where x and y are literals split by the wildcard node in
					// the middle, we want to spawn a forked traversal whenever
					// we are at a node which represents a string that either
					// equals the literal x or has the literal x as a proper
					// suffix.
					//
					// In the original example, as 'bcd' has 'c' as a suffix at
					// the node representing literal 'bc', that node should also
					// spawn a forked traversal, as should the node representing
					// the literal 'abc' in 'abcd' for similar reasons.
					//
					// To do this, we will introduce the concept of forked traversal
					// links. During matching, when a node n is reached, in addition
					// to the forked traversals it spawns directly, all the forked
					// traversals that are connected to any node linked by a forked
					// traversal link to it should be spawned as well.
					//
					// We will compute forked traversal links with the help of
					// failure links. Recall that due to the nature of failure
					// links, if we have a node Nk representing string us and a
					// node N representing string u, either Nk = N or there
					// exist nodes N1, N2, N3, ... Nk such that f(Ni) = F(Ni-1),
					// 1 < n <= k, and f(N1) = N. In other words, a set of
					// patterns which have literal nodes that are suffixes of
					// one another is connected by failure links. Given that our
					// goal is to spawn all the forked traversals connected to
					// suffixes of the representative string of a node, we can
					// simply set the forked traversal link of a node N to f(N)
					// if f(N) itself has a forked traversal link or f(N) spawns
					// forked traversals directly.
					//
					// Note:
					// The ideas above are based on the findings of the paper
					// 'Generalized Aho-Corasick Algorithm for Signature Based
					// Anti-Virus Applications', authored by Tsem-Huei Lee.
					if (
						// either the failure link spawns forked traversals directly...
						failureLink.flags & BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly ||
						// or it has a forked traversal link.
						failureLink.forkedTraversalLink
					) {
						childNode.forkedTraversalLink = failureLink;
						// Apply path compression. Let t(N) denote the forked
						// traversal link of N. If t(N) does not spawn forked
						// traversals directly, set t(N) to t(t(N)).
						if (!(childNode.forkedTraversalLink.flags & BlacklistTrieNodeFlag.SpawnsForkedTraversalsDirectly)) {
							childNode.forkedTraversalLink = childNode.forkedTraversalLink.forkedTraversalLink;
						}
					}
					childNode.failureLink = failureLink;
				} else {
					childNode.failureLink = this.rootNode;
				}
				queue.push(childNode);
			}

			node.outputLink = !!(node.failureLink.flags & BlacklistTrieNodeFlag.IsOutputNode)
				? node.failureLink
				: node.failureLink.outputLink;
		}
	}
}

/**
 * Options for the [[PatternMatcher]].
 */
export interface PatternMatcherOptions {
	/**
	 * A list of blacklisted terms to match on.
	 *
	 * **User-supplied patterns**
	 *
	 * Allowing user-supplied patterns is potentially dangerous and frowned
	 * upon, but should in theory be safe if the `forkedTraversalLimit` is set
	 * to a reasonable value. In addition, the number of optional nodes that
	 * are permitted in patterns should be limited to prevent pattern expansion
	 * from resulting in an unacceptable number of simple patterns.
	 */
	blacklistedPatterns: BlacklistedTerm[];

	/**
	 * A list of whitelisted terms. If a whitelisted term
	 * matches some part of the text, a match of a blacklisted pattern
	 * on the same will not be reported.
	 *
	 * For example, if we had a pattern `penis` and a whitelisted term
	 * `pen is`, only one match would be reported for the input text
	 * `penis. the pen is mightier than the sword.`
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

	/**
	 * The limit to the number of forked traversals that can be spawned before
	 * an error will be raised. Generally speaking, the more forked traversals
	 * that are spawned, the slower the matcher will be.
	 *
	 * Forked traversals can only be spawned if the set of blacklisted patterns
	 * contains wildcards (`?`). As such, if you do not use any wildcards in your
	 * patterns, there is no need to worry about this option at all.
	 *
	 * Otherwise, the default value of `50` is an fairly conservative upper
	 * bound on the number of forked traversals that can be spawned when
	 * matching against a set of "normal" patterns. **It should rarely, if ever,
	 * be hit.**
	 *
	 * In pathological cases the number of forked traversals _may_ grow
	 * exponentially if the set of input patterns contains an exceptionally high
	 * number of wildcards. Please open an issue if you find this is the case.
	 *
	 * @default 50
	 */
	forkedTraversalLimit?: number;
}
