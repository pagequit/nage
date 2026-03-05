import type { Box } from "#/engine/Box.ts";

export default class MapProxy<K, V> {
	map: Map<K, Box<V>>;

	constructor() {
		this.map = new Map();
	}

	get(key: K): V | undefined {
		return this.map.get(key)?.value;
	}
}
