/**
 * A first-in first-out queue.
 *
 * @copyright
 * This is a derivative work of https://github.com/invertase/denque.
 *
 * ```text
 * Copyright (c) 2018 Mike Diarmid (Salakar) <mike.diarmid@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ```
 */
export class Queue<T> {
	private data = new Array<T | undefined>(4).fill(undefined);
	private mask = 0x3;
	private head = 0;
	private tail = 0;

	public push(value: T) {
		this.data[this.tail] = value;
		this.tail = (this.tail + 1) & this.mask;
		if (this.tail === this.head) this.growArray();
	}

	public shift() {
		if (this.head === this.tail) return undefined;
		const value = this.data[this.head];
		this.data[this.head] = undefined;
		this.head = (this.head + 1) & this.mask;
		return value;
	}

	public get length() {
		if (this.head <= this.tail) return this.tail - this.head;
		return this.capacity - (this.head - this.tail);
	}

	public get capacity() {
		return this.data.length;
	}

	private growArray() {
		if (this.head > 0) {
			// Create a new array from the data, but in proper order.
			const inOrder = this.data.slice(this.head, this.capacity);
			inOrder.push(...this.data.slice(0, this.tail));
			this.data = inOrder;
			this.head = 0;
		}

		this.tail = this.capacity;
		this.data.length <<= 1;
		this.mask = (this.mask << 1) | 1;
	}
}
