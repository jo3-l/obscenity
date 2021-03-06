import type { TransformerContainer } from '../../transformer/Transformers';
import { TransformerSet } from '../../transformer/TransformerSet';
import { CharacterIterator } from '../../util/CharacterIterator';
import { CircularBuffer } from '../../util/CircularBuffer';
import { Queue } from '../../util/Queue';
import { IntervalCollection } from '../IntervalCollection';
import type { ForwardingEdgeCollection } from './trie/edge/ForwardingEdgeCollection';
import { WhitelistTrieNode } from './trie/WhitelistTrieNode';

export class WhitelistedTermMatcher {
	private readonly rootNode = new WhitelistTrieNode();
	private currentId = 0;
	private readonly matchLengths = new Map<number, number>(); // term ID -> match length
	private maxMatchLength = 0;
	private readonly transformers: TransformerSet;

	public constructor({ terms, transformers = [] }: WhitelistedTermMatcherOptions) {
		this.transformers = new TransformerSet(transformers);
		for (const term of terms) this.registerTerm(term);
		this.constructLinks();
		this.useUnderlyingEdgeCollectionImplementation(this.rootNode);
	}

	public getMatches(text: string) {
		if (this.rootNode.edges.size === 0) return new IntervalCollection();
		const usedIndices = new CircularBuffer<number>(this.maxMatchLength);
		const matches = new IntervalCollection();

		let currentNode = this.rootNode;
		const iter = new CharacterIterator(text);
		for (const char of iter) {
			const transformed = this.transformers.applyTo(char);
			if (transformed === undefined) continue; // Returning undefined from a transformer skips that character.

			// Mark the current position as one used for matching.
			usedIndices.push(iter.position);

			// Follow failure links until we find a node that has a transition for the current character.
			while (currentNode !== this.rootNode && !currentNode.edges.get(transformed)) {
				currentNode = currentNode.failureLink;
			}
			currentNode = currentNode.edges.get(transformed) ?? this.rootNode;

			// Report matches as needed.
			if (currentNode.isOutputNode) {
				const matchLength = this.matchLengths.get(currentNode.termId)!;
				const startIndex = usedIndices.get(usedIndices.length - matchLength)!;
				// Adjust the end index by iter.lastWidth - 1 to account for surrogate pairs.
				matches.insert(startIndex, iter.position + iter.lastWidth - 1);
			}

			let linkedNode = currentNode.outputLink;
			while (linkedNode) {
				const matchLength = this.matchLengths.get(linkedNode.termId)!;
				const startIndex = usedIndices.get(usedIndices.length - matchLength)!;
				// Similar.
				matches.insert(startIndex, iter.position + iter.lastWidth - 1);
				linkedNode = linkedNode.outputLink;
			}
		}

		this.transformers.resetAll();
		return matches;
	}

	private registerTerm(term: string) {
		if (term.length === 0) throw new Error('Unexpected empty whitelisted term.');

		const id = this.currentId++;
		// Track the match length of this term.
		const chars = [...new CharacterIterator(term)];
		const matchLength = chars.length;
		this.matchLengths.set(id, matchLength);
		if (matchLength > this.maxMatchLength) this.maxMatchLength = matchLength;

		let currentNode = this.rootNode;
		for (const char of chars) {
			const nextNode = currentNode.edges.get(char);
			if (nextNode) {
				currentNode = nextNode;
			} else {
				const newNode = new WhitelistTrieNode();
				currentNode.edges.set(char, newNode);
				currentNode = newNode;
			}
		}

		currentNode.isOutputNode = true;
		currentNode.termId = id;
	}

	private constructLinks() {
		// Compute the failure and output functions for the trie. This
		// implementation is fairly straightforward and is essentially the exact
		// same as that detailed in Aho and Corasick's original paper. Refer to
		// section 3 in said paper for more details.
		this.rootNode.failureLink = this.rootNode;
		const queue = new Queue<WhitelistTrieNode>();
		for (const node of this.rootNode.edges.values()) {
			node.failureLink = this.rootNode;
			queue.push(node);
		}

		while (queue.length > 0) {
			const node = queue.shift()!;
			for (const [char, childNode] of node.edges) {
				let cur = node.failureLink;
				while (!cur.edges.get(char) && cur !== this.rootNode) cur = cur.failureLink;

				childNode.failureLink = cur.edges.get(char) ?? this.rootNode;
				queue.push(childNode);
			}

			node.outputLink = node.failureLink.isOutputNode ? node.failureLink : node.failureLink.outputLink;
		}
	}

	private useUnderlyingEdgeCollectionImplementation(node: WhitelistTrieNode) {
		node.edges = (node.edges as ForwardingEdgeCollection<WhitelistTrieNode>).underlyingImplementation;
		for (const childNode of node.edges.values()) this.useUnderlyingEdgeCollectionImplementation(childNode);
	}
}

export interface WhitelistedTermMatcherOptions {
	terms: string[];
	transformers?: TransformerContainer[];
}
