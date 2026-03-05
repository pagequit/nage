export type Process = (id: string, delta: number) => void;

export const entityProcessMap = new Map<string, Process>();
export const entityBlueprintsMap = new Map<string, Map<string, unknown>>();

export function defineEntity<T extends { [key: string]: unknown }>(
	name: string,
	blueprints: T,
): (fn: Process) => void {
	entityBlueprintsMap.set(name, new Map(Object.entries(blueprints)));

	return (fn) => {
		entityProcessMap.set(name, fn);
	};
}
