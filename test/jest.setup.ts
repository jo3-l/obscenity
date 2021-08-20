expect.extend({
	toBePermutationOf<T>(this: jest.MatcherContext, received: T[], expected: T[]) {
		const options = {
			isNot: this.isNot,
			promise: this.promise,
		};

		if (received.length !== expected.length) {
			return {
				message: () => `${this.utils.matcherHint('toBePermutationOf', undefined, undefined, options)}
			
Expected: array of length ${expected.length} (${this.utils.printExpected(expected)})
Received: array of length ${received.length} (${this.utils.printReceived(received)})`,
				pass: false,
			};
		}

		const copy = [...expected];
		let maxIndex = expected.length - 1;

		for (const element of received) {
			// See if there's an element in expected that hasn't been used yet and is
			// deeply equal to the current value.
			let pass = false;
			for (let i = maxIndex; i >= 0; i--) {
				pass = this.equals(element, copy[i]);
				if (pass) {
					// Swap the current element with the one at the maximum index,
					// then mark the maximum index as unusable.
					// This ensures that we don't mark two values in received as equal
					// to the same value in expected.
					copy[i] = copy[maxIndex--];
					break;
				}
			}

			if (!pass) {
				// No value in expected is deeply equal to the current value in received.
				const message = () => {
					return `${this.utils.matcherHint('toBePermutationOf', undefined, undefined, options)}

Expected: a permutation of ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(received)}
}
				`;
				};
				return { message, pass: false };
			}
		}

		return {
			message: () => `${this.utils.matcherHint('toBePermutationOf', undefined, undefined, options)}
			
Expected: not a permutation of ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(received)}`,
			pass: true,
		};
	},
});

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		interface Matchers<R> {
			toBePermutationOf(expected: readonly any[]): R;
		}
	}
}

export {};
