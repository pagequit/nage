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
	drawSprite(ctx, sprite, animation.xIndex, animation.yIndex, x, y);

	animation.frameDelta += delta;
	if (animation.frameDelta >= animation.frameTime) {
		animation.frameDelta = animation.frameDelta - animation.frameTime;

		animation.xIndex += 1;
		if (animation.xIndex >= sprite.xFrames) {
			animation.xIndex = 0;
		}
	}
}
