import { describe, expect, it } from 'vitest';

import type { LiteralNode, OptionalNode } from '@/pattern/Nodes';
import { SyntaxKind } from '@/pattern/Nodes';
import { compilePatternToRegExp, getRegExpStringForNode, potentiallyMatchesEmptyString } from '@/pattern/Util';
import { CharacterIterator } from '@/util/CharacterIterator';

function toLiteralNode(str: string): LiteralNode {
	return { kind: SyntaxKind.Literal, chars: [...new CharacterIterator(str)] };
}

describe('potentiallyMatchesEmptyString()', () => {
	it('should return false for patterns with wildcards', () => {
		expect(
			potentiallyMatchesEmptyString({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [{ kind: SyntaxKind.Wildcard }],
			}),
		).toBeFalsy();
	});

	it('should return false for literal patterns', () => {
		expect(
			potentiallyMatchesEmptyString({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [toLiteralNode('foo')],
			}),
		).toBeFalsy();
	});

	it('should return false for patterns composed of combo of literals and optionals', () => {
		expect(
			potentiallyMatchesEmptyString({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [toLiteralNode('foo'), { kind: SyntaxKind.Optional, childNode: toLiteralNode('bar') }],
			}),
		).toBeFalsy();
	});

	it('should return true for patterns solely composed of optionals', () => {
		expect(
			potentiallyMatchesEmptyString({
				requireWordBoundaryAtStart: false,
				requireWordBoundaryAtEnd: false,
				nodes: [
					{ kind: SyntaxKind.Optional, childNode: { kind: SyntaxKind.Wildcard } },
					{ kind: SyntaxKind.Optional, childNode: toLiteralNode('bar') },
				],
			}),
		).toBeTruthy();
	});

	it('should return true for empty patterns', () => {
		expect(
			potentiallyMatchesEmptyString({ requireWordBoundaryAtStart: false, requireWordBoundaryAtEnd: false, nodes: [] }),
		).toBeTruthy();
	});
});

describe('compilePatternToRegExp()', () => {
	it('should add \\b at the begin if requireWordBoundaryAtStart is true', () => {
		const regExp = compilePatternToRegExp({
			requireWordBoundaryAtStart: true,
			requireWordBoundaryAtEnd: false,
			nodes: [toLiteralNode('bye')],
		});
		expect(regExp.source).toBe('\\bbye');
	});

	it('should add a \\b at the end if requireWordBoundaryAtEnd is true', () => {
		const regExp = compilePatternToRegExp({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: true,
			nodes: [toLiteralNode('hi')],
		});
		expect(regExp.source).toBe('hi\\b');
	});

	it('should return the regexp with dotall and global flags on', () => {
		const regExp = compilePatternToRegExp({
			requireWordBoundaryAtStart: false,
			requireWordBoundaryAtEnd: true,
			nodes: [toLiteralNode('yo'), { kind: SyntaxKind.Wildcard }],
		});
		expect(regExp.dotAll).toBeTruthy();
		expect(regExp.global).toBeTruthy();
	});
});

describe('getRegExpStringForNode()', () => {
	describe('literals', () => {
		it('should return the text of the string directly if it contains no special chars', () => {
			expect(getRegExpStringForNode(toLiteralNode('hi'))).toBe('hi');
			expect(getRegExpStringForNode(toLiteralNode(':D'))).toBe(':D');
			expect(getRegExpStringForNode(toLiteralNode('🌉'))).toBe('🌉');
		});

		it('should escape special characters with a backslash', () => {
			expect(getRegExpStringForNode(toLiteralNode('['))).toBe('\\[');
			expect(getRegExpStringForNode(toLiteralNode('.'))).toBe('\\.');
			expect(getRegExpStringForNode(toLiteralNode('hi?'))).toBe('hi\\?');
		});
	});

	describe('optionals', () => {
		it('should return (?:inner)?', () => {
			const optional: OptionalNode = { kind: SyntaxKind.Optional, childNode: toLiteralNode('hello') };
			expect(getRegExpStringForNode(optional)).toBe('(?:hello)?');
		});
	});

	describe('wildcards', () => {
		it('should return a dot', () => {
			expect(getRegExpStringForNode({ kind: SyntaxKind.Wildcard })).toBe('.');
		});
	});
});
