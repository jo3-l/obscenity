import { pattern } from '../../src/pattern/Pattern';
import { assignIncrementingIds } from '../../src/matcher/BlacklistedTerm';

describe('assignIncrementingIds()', () => {
	it('should assign incrementing, unique IDs to the input patterns', () => {
		const pat0 = pattern`|world|`;
		const pat1 = pattern`:D`;
		const pat2 = pattern`??`;
		const pat3 = pattern`hmm interesting`;
		expect(assignIncrementingIds([pat0, pat1, pat2, pat3])).toStrictEqual([
			{ id: 0, pattern: pat0 },
			{ id: 1, pattern: pat1 },
			{ id: 2, pattern: pat2 },
			{ id: 3, pattern: pat3 },
		]);
	});
});
