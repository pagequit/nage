import { type EntityInstance, useEntity } from "#/engine/Entity.ts";
import { drawSprite } from "#/lib/Sprite.ts";
import data from "./data.json";

const { draw, process } = useEntity(data);

draw((entity: EntityInstance, ctx: CanvasRenderingContext2D) => {
	drawSprite(
		ctx,
		entity.sprite,
		entity.position.x,
		entity.position.y,
		entity.width,
		entity.height,
	);
});

process((_entity, _delta) => {});
