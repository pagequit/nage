export type Entity<T extends object> = {
	name: string;
	state: T;
};

export type Process<T extends object> = (instance: T, delta: number) => void;

export const entityMap = new Map();
export const entityProcessMap = new Map();

export function defineEntity<T extends object>(
	name: string,
	state: T,
): (fn: Process<T>) => void {
	entityMap.set(name, state);

	return (fn) => {
		entityProcessMap.set(name, fn);
	};
}
