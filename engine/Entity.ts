import { createVector, type Vector } from "#/lib/Vector.ts";

export type Indirect = never;

export type Entity<T> = {
	id: string;
	position: Vector;
} & T;

export type Animate<T> = (
	entity: Entity<T>,
	ctx: CanvasRenderingContext2D,
	delta: number,
) => void;

export type Process<T> = (entity: Entity<T>, delta: number) => void;

export const entityMap = new Map<string, Entity<unknown>>();
export const entityAnimateMap = new Map<string, Animate<Indirect>>();
export const entityProcessMap = new Map<string, Process<Indirect>>();

export function useEntity<T extends object>(
	id: string,
	data: T,
): {
	animate: (fn: Animate<T>) => void;
	process: (fn: Process<T>) => void;
} {
	entityMap.set(id, {
		id,
		position: createVector(),
		...data,
	});

	return {
		animate(fn) {
			entityAnimateMap.set(id, fn);
		},
		process(fn) {
			entityProcessMap.set(id, fn);
		},
	};
}
