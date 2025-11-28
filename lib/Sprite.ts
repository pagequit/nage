export type Sprite = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
	xIndex: number;
	yIndex: number;
};

export function createSprite(
	image: HTMLImageElement,
	xFrames: number,
	yFrames: number,
): Sprite {
	return {
		image,
		xFrames,
		yFrames,
		frameWidth: image.width / xFrames,
		frameHeight: image.height / yFrames,
		xIndex: 0,
		yIndex: 0,
	};
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sprite: Sprite,
	x: number,
	y: number,
): void {
	ctx.drawImage(
		sprite.image,
		sprite.xIndex * sprite.frameWidth,
		sprite.yIndex * sprite.frameHeight,
		sprite.frameWidth,
		sprite.frameHeight,
		x,
		y,
		sprite.frameWidth,
		sprite.frameHeight,
	);
}
