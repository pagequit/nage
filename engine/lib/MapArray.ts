import type { Box } from "#/engine/Box.ts";

export default class MapArray<K, V> {
	map: Map<K, Box<V>>;
	array: Array<[K, Box<V>]>;

	constructor(iterable?: Iterable<[K, Box<V>]>) {
		this.map = new Map(iterable);
		this.array = iterable ? [...iterable] : [];
	}

	delete(key: K): void {
		if (this.map.delete(key)) {
			this.array[this.array.findIndex((e) => e[0] === key)] =
				this.array[this.array.length - 1];
			this.array.pop();
		}
	}

	set(key: K, value: Box<V>): void {
		if (this.map.has(key)) {
			this.array.find((e) => e[0] === key)![1] = value;
		} else {
			this.array.push([key, value]);
		}

		this.map.set(key, value);
	}

	get(key: K): Box<V> | undefined {
		return this.map.get(key);
	}

	entries(): Array<[K, Box<V>]> {
		return this.array;
	}
}
