import type { Sprite } from "#/lib/Sprite.ts";
import type { Vector } from "#/lib/Vector.ts";

export type Entity = {
	id: string;
	src: string;
	width: number;
	height: number;
};

export type EntityInstance = {
	position: Vector;
	width: number;
	height: number;
	sprite: Sprite;
};

export type Draw = (
	entity: EntityInstance,
	ctx: CanvasRenderingContext2D,
) => void;

export type Process = (entity: EntityInstance, delta: number) => void;

export function createEntity(
	id: string,
	src: string,
	width: number = 16,
	height: number = 16,
): Entity {
	return { id, width, height, src };
}

export const entityMap = new Map<string, Entity>();
export const entityDrawMap = new Map<string, Draw>();
export const entityProcessMap = new Map<string, Process>();

export function useEntity(data: Entity): {
	draw: (fn: Draw) => void;
	process: (fn: Process) => void;
} {
	entityMap.set(data.id, data);

	return {
		draw(fn: Draw): void {
			entityDrawMap.set(data.id, fn);
		},
		process(fn: Process): void {
			entityProcessMap.set(data.id, fn);
		},
	};
}
