import { useEntity } from "#/engine/Entity.ts";
import { drawSprite } from "#/lib/Sprite.ts";
import data from "./data.json";

const { draw, process, entity } = await useEntity(data);

draw((ctx: CanvasRenderingContext2D) => {
	drawSprite(ctx, entity.sprite, 0, 0, 16, 16);
});

process((_delta) => {});
