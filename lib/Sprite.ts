export type Sprite = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
	x: number;
	y: number;
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
		x: 0,
		y: 0,
	};
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sprite: Sprite,
	x: number,
	y: number,
	width: number,
	height: number,
): void {
	ctx.drawImage(
		sprite.image,
		sprite.x,
		sprite.y,
		sprite.frameWidth,
		sprite.frameHeight,
		x,
		y,
		width,
		height,
	);
}
