import { loadImage } from "./loadImage.ts";

export type Sprite = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
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
	};
}

export async function fromSrc(
	src: string,
	xFrames: number,
	yFrames: number,
): Promise<Sprite> {
	return createSprite(await loadImage(src), xFrames, yFrames);
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sprite: Sprite,
	xIndex: number,
	yIndex: number,
	x: number,
	y: number,
	width?: number,
	height?: number,
): void {
	ctx.drawImage(
		sprite.image,
		xIndex * sprite.frameWidth,
		yIndex * sprite.frameHeight,
		sprite.frameWidth,
		sprite.frameHeight,
		x,
		y,
		width || sprite.frameWidth,
		height || sprite.frameHeight,
	);
}
