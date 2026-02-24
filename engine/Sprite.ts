import { loadImage } from "#/engine/lib/loadImage.ts";

export type Sprite = {
	src: string;
	xStart: number;
	yStart: number;
	width: number;
	height: number;
};

export type SpriteSheet = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
};

export type SpriteAnimation = {
	sprite: Sprite;
	xIndex: number;
	yIndex: number;
	frameTime: number;
	frameDelta: number;
};

// It's not possible to crate a structured clone of a HTMLImageElement and it would be a
// waste of memory anyways since we use the HTMLImageElement only as reference for draw calls.
// Therefore the SpriteSheet will stored by it's image source.
export const spriteSheetMap = new Map<string, SpriteSheet>();

export function createSpriteSheet(
	image: HTMLImageElement,
	xFrames: number,
	yFrames: number,
): SpriteSheet {
	return {
		image,
		xFrames,
		yFrames,
		frameWidth: image.width / xFrames,
		frameHeight: image.height / yFrames,
	};
}

export async function useSpriteSheetSrc(
	src: string,
	xFrames: number,
	yFrames: number,
): Promise<string> {
	spriteSheetMap.set(
		src,
		createSpriteSheet(await loadImage(src), xFrames, yFrames),
	);

	return src;
}

export function createSpriteAnimation(
	sprite: Sprite,
	frameTime: number,
	yIndex: number,
): SpriteAnimation {
	sprite.yStart = yIndex * spriteSheetMap.get(sprite.src)!.frameHeight;

	return {
		sprite,
		xIndex: 0,
		yIndex,
		frameTime,
		frameDelta: 0,
	};
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sheet: SpriteSheet,
	xStart: number,
	yStart: number,
	x: number,
	y: number,
	width?: number,
	height?: number,
): void {
	ctx.drawImage(
		sheet.image,
		xStart,
		yStart,
		sheet.frameWidth,
		sheet.frameHeight,
		x,
		y,
		width || sheet.frameWidth,
		height || sheet.frameHeight,
	);
}

export function animateSprite(animation: SpriteAnimation, delta: number): void {
	const sheet = spriteSheetMap.get(animation.sprite.src)!;
	if ((animation.frameDelta += delta) > animation.frameTime) {
		animation.frameDelta = 0;
		if ((animation.xIndex += 1) >= sheet.xFrames) {
			animation.xIndex = 0;
		}
	}

	animation.sprite.xStart = animation.xIndex * sheet.frameWidth;
}
