import { createVector, type Vector } from "#/lib/Vector.ts";

export type Entity<T> = {
	id: string;
	position: Vector;
	state: T;
};

export type Animate<T> = (
	entity: Entity<T>,
	ctx: CanvasRenderingContext2D,
	delta: number,
) => void;

export type Process<T> = (entity: Entity<T>, delta: number) => void;

export const entityMap = new Map<string, Entity<unknown>>();
export const entityAnimateMap = new Map<string, Animate<never>>();
export const entityProcessMap = new Map<string, Process<never>>();

export function useEntity<T>(
	id: string,
	state: T,
): {
	animate: (fn: Animate<T>) => void;
	process: (fn: Process<T>) => void;
} {
	entityMap.set(id, {
		id,
		position: createVector(),
		state,
	});

	return {
		animate(fn: Animate<T>): void {
			entityAnimateMap.set(id, fn);
		},
		process(fn: Process<T>): void {
			entityProcessMap.set(id, fn);
		},
	};
}
