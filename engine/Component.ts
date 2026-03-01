export const componentMap = new Map();

export function defineComponent<T>(key: string): Map<string, T> {
	if (!componentMap.has(key)) {
		componentMap.set(key, new Map());
	}

	return componentMap.get(key)!;
}
