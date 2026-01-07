import { drawSprite, type Sprite } from "#/lib/Sprite.ts";

export type Animation = {
	xIndex: number;
	yIndex: number;
	frameTime: number;
	frameDelta: number;
};

export function createAnimation(yIndex: number, frameTime: number): Animation {
	return {
		xIndex: 0,
		yIndex,
		frameTime,
		frameDelta: 0,
	};
}

export function animateSprite(
	ctx: CanvasRenderingContext2D,
	sprite: Sprite,
	animation: Animation,
	x: number,
	y: number,
	delta: number,
): void {
	if ((animation.frameDelta += delta) > animation.frameTime) {
		animation.frameDelta = 0;
		if ((animation.xIndex += 1) >= sprite.xFrames) {
			animation.xIndex = 0;
		}
	}
	drawSprite(ctx, sprite, animation.xIndex, animation.yIndex, x, y);
}
