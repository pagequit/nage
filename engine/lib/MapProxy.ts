import type { Box } from "#/engine/Box.ts";

export default class MapProxy<K, V> {
	map: Map<K, Box<V>>;

	constructor(iterable?: Iterable<readonly [K, Box<V>]>) {
		this.map = new Map(iterable);
	}

	get(key: K): Box<V> | undefined {
		return this.map.get(key);
	}

	entries(): MapIterator<[K, Box<V>]> {
		return this.map.entries();
	}

	keys(): MapIterator<K> {
		return this.map.keys();
	}

	values(): MapIterator<Box<V>> {
		return this.map.values();
	}
}
