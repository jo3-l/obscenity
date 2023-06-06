import type { LiteralNode, OptionalNode } from '../../src/pattern/Nodes';
import { SyntaxKind } from '../../src/pattern/Nodes';
import type { SimpleNode } from '../../src/pattern/Simplifier';
import {
	compilePatternToRegExp,
	computePatternMatchLength,
	getRegExpStringForNode,
	groupByNodeType,
	potentiallyMatchesEmptyString,
} from '../../src/pattern/Util';
import { CharacterIterator } from '../../src/util/CharacterIterator';

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

describe('computePatternMatchLength()', () => {
	it('should return 0 if given an empty array', () => {
		expect(computePatternMatchLength([])).toBe(0);
	});

	it('should return the total number of chars in literal nodes plus 1 for each wildcard node', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Literal, chars: [0, 0] },
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Literal, chars: [0, 0, 0] },
		];
		expect(computePatternMatchLength(nodes)).toBe(6);
	});
});

describe('groupByNodeType()', () => {
	it('should return an empty array if nodes=[]', () => {
		expect(groupByNodeType([])).toStrictEqual([]);
	});

	it('should return one literal group if there are only literal nodes in the input', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Literal, chars: [1, 2, 3] },
			{ kind: SyntaxKind.Literal, chars: [2, 3, 4] },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([{ isLiteralGroup: true, literals: nodes }]);
	});

	it('should return one wildcard group if there are only wildcards in the input', () => {
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([{ isLiteralGroup: false, wildcardCount: 3 }]);
	});

	it('should group literals and wildcards together', () => {
		const literal0: LiteralNode = { kind: SyntaxKind.Literal, chars: [1, 2, 3] };
		const literal1: LiteralNode = { kind: SyntaxKind.Literal, chars: [2, 3, 4] };
		const literal2: LiteralNode = { kind: SyntaxKind.Literal, chars: [3, 4, 5] };
		const nodes: SimpleNode[] = [
			{ kind: SyntaxKind.Wildcard },
			literal0,
			literal1,
			{ kind: SyntaxKind.Wildcard },
			literal2,
			{ kind: SyntaxKind.Wildcard },
			{ kind: SyntaxKind.Wildcard },
		];
		expect(groupByNodeType(nodes)).toStrictEqual([
			{ isLiteralGroup: false, wildcardCount: 1 },
			{ isLiteralGroup: true, literals: [literal0, literal1] },
			{ isLiteralGroup: false, wildcardCount: 1 },
			{ isLiteralGroup: true, literals: [literal2] },
			{ isLiteralGroup: false, wildcardCount: 2 },
		]);
	});
});
