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

export function createEntity(
	id: string,
	src: string,
	width: number = 16,
	height: number = 16,
): Entity {
	return { id, width, height, src };
}

export async function loadEntity(name: string): Promise<EntityInstance> {
	const entity = (await import(`#/entities/${name}/index.ts`)).default;

	const { width, height } = entity;
	const sprite = createSprite(await loadImage(entity.src), 2, 4);
	const position = createVector();

	return { position, width, height, sprite };
}
