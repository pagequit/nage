import type { Box } from "#/engine/Box.ts";
import { sceneChangeSet, sceneComponentsMap } from "#/engine/Scene.ts";
import { drawSprite, type Sprite, spriteSheetMap } from "#/engine/Sprite.ts";
import type { Vector } from "#/engine/Vector.ts";

const drawables: Array<{ position: Box<Vector>; sprite: Box<Sprite> }> = [];
sceneChangeSet.add((sceneData) => {
	drawables.length = 0;

	const sprites = [
		...sceneComponentsMap.get(sceneData.name)!.get("sprite")!.values(),
	] as Array<Box<Sprite>>;

	sceneComponentsMap
		.get(sceneData.name)!
		.get("position")!
		.values()
		.forEach((box, index) => {
			drawables.push({
				position: box as Box<Vector>,
				sprite: sprites[index],
			});
		});
});

export function drawSprites(ctx: CanvasRenderingContext2D): void {
	for (const drawable of drawables.sort(
		(a, b) => a.position.value.y - b.position.value.y,
	)) {
		drawSprite(
			ctx,
			spriteSheetMap.get(drawable.sprite.value.src)!,
			drawable.sprite.value.xStart,
			drawable.sprite.value.yStart,
			drawable.position.value.x,
			drawable.position.value.y,
		);
	}
}
