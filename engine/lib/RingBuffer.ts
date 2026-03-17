export default class RingBuffer<T> {
	size: number;
	mask: number;
	cursor: number;
	buffer: Array<T>;

	constructor(size: number, blueprint: T) {
		if ((size & (size - 1)) !== 0) {
			throw new Error("size must be a power of two");
		}

		this.size = size;
		this.mask = size - 1;
		this.cursor = 0;
		this.buffer = [];

		for (let i = 0; i < size; i++) {
			this.buffer.push(structuredClone(blueprint));
		}
	}

	next(): T {
		return this.buffer[this.cursor++ & this.mask];
	}
}
