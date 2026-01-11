import { createVector, type Vector } from "#/lib/Vector.ts";

export type Indirect = never;

export type Entity<T> = {
	name: string;
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
	meta: { url: string },
	state: T,
): {
	animate: (fn: Animate<T>) => void;
	process: (fn: Process<T>) => void;
} {
	const name = meta.url.match(/entities\/(.+)\/entity\.ts$/)![1];
	entityMap.set(name, {
		name,
		position: createVector(),
		...state,
	});

	return {
		animate(fn) {
			entityAnimateMap.set(name, fn);
		},
		process(fn) {
			entityProcessMap.set(name, fn);
		},
	};
}
