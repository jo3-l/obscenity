import { describe, expect, it } from 'vitest';

import { assignIncrementingIds } from '@/matcher/BlacklistedTerm';
import { pattern } from '@/pattern/Pattern';

describe('assignIncrementingIds()', () => {
	it('should assign incrementing, unique IDs to the input patterns', () => {
		const firstPattern = pattern`|world|`;
		const secondPattern = pattern`:D`;
		const thirdPattern = pattern`??`;
		const fourthPattern = pattern`hmm interesting`;
		expect(assignIncrementingIds([firstPattern, secondPattern, thirdPattern, fourthPattern])).toStrictEqual([
			{ id: 0, pattern: firstPattern },
			{ id: 1, pattern: secondPattern },
			{ id: 2, pattern: thirdPattern },
			{ id: 3, pattern: fourthPattern },
		]);
	});
});
