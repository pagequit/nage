import { drawSprite, type Sprite } from "#/lib/Sprite.ts";

export const spriteMap = new Map<string, Sprite>();

export type Animation = {
	spriteSrc: string;
	xIndex: number;
	yIndex: number;
	frameTime: number;
	frameDelta: number;
};

export function createAnimation(
	sprite: Sprite,
	frameTime: number,
	yIndex: number,
): Animation {
	const spriteSrc = sprite.image.src;
	spriteMap.set(spriteSrc, sprite);

	return {
		spriteSrc,
		xIndex: 0,
		yIndex,
		frameTime,
		frameDelta: 0,
	};
}

export function playAnimation(
	ctx: CanvasRenderingContext2D,
	animation: Animation,
	x: number,
	y: number,
	delta: number,
): void {
	const sprite = spriteMap.get(animation.spriteSrc)!;

	if ((animation.frameDelta += delta) > animation.frameTime) {
		animation.frameDelta = 0;
		if ((animation.xIndex += 1) >= sprite.xFrames) {
			animation.xIndex = 0;
		}
	}

	drawSprite(ctx, sprite, animation.xIndex, animation.yIndex, x, y);
}
