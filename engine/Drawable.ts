import { drawSprite, type Sprite, spriteSheetMap } from "#/engine/Sprite.ts";
import type { Vector } from "#/engine/Vector.ts";

export type Drawable = {
	position: Vector;
	sprite: Sprite;
};

export function isDrawable<T>(
	entity: {
		position?: Vector;
		sprite?: Sprite;
	} & T,
): entity is Drawable & T {
	return (
		typeof entity.position === "object" && typeof entity.sprite === "object"
	);
}

export function draw(ctx: CanvasRenderingContext2D, drawable: Drawable): void {
	drawSprite(
		ctx,
		spriteSheetMap.get(drawable.sprite.src)!,
		drawable.sprite.xStart,
		drawable.sprite.yStart,
		drawable.position.x,
		drawable.position.y,
	);
}
