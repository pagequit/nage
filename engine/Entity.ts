import { loadImage } from "#/lib/loadImage.ts";
import { createSprite, type Sprite } from "#/lib/Sprite.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";

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

export type Draw = (ctx: CanvasRenderingContext2D) => void;

export type Process = (delta: number) => void;

export function createEntity(
	id: string,
	src: string,
	width: number = 16,
	height: number = 16,
): Entity {
	return { id, width, height, src };
}

export const entityMap = new Map<string, EntityInstance>();
export const entityDrawMap = new Map<string, Draw>();
export const entityProcessMap = new Map<string, Process>();

export async function useEntity(data: Entity): Promise<{
	draw: (fn: Draw) => void;
	process: (fn: Process) => void;
	entity: EntityInstance;
}> {
	const sprite = createSprite(await loadImage(data.src), 2, 4);

	const entity: EntityInstance = {
		position: createVector(),
		width: data.width,
		height: data.height,
		sprite,
	};

	entityMap.set(data.id, entity);

	return {
		draw(fn: Draw): void {
			entityDrawMap.set(data.id, fn);
		},
		process(fn: Process): void {
			entityProcessMap.set(data.id, fn);
		},
		entity,
	};
}
