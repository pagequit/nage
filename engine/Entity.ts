export type Process = (id: string, delta: number) => void;

export const entityProcessMap = new Map<string, Process>();
export const entityBlueprintMap = new Map<string, Map<string, unknown>>();

export function defineEntity<T extends { [key: string]: unknown }>(
	name: string,
	blueprint: T,
): (fn: Process) => void {
	entityBlueprintMap.set(name, new Map(Object.entries(blueprint)));

	return (fn) => {
		entityProcessMap.set(name, fn);
	};
}
