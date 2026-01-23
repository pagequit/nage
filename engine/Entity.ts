import type { Animation } from "#/engine/Animation.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";

export type Indirect = never;

export type Entity<T> = {
	name: string;
	position: Vector;
	animation: Animation;
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

export function defineEntity<T extends { animation: Animation }>(
	name: string,
	state: T,
): {
	animate: (fn: Animate<T>) => void;
	process: (fn: Process<T>) => void;
} {
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
