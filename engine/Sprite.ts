import { loadImage } from "./lib/loadImage";

export type SpriteSheet = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
};

export type SpriteAnimation = {
	src: string;
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
	src: string,
	frameTime: number,
	yIndex: number,
): SpriteAnimation {
	return {
		src,
		xIndex: 0,
		yIndex,
		frameTime,
		frameDelta: 0,
	};
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sheet: SpriteSheet,
	xIndex: number,
	yIndex: number,
	x: number,
	y: number,
	width?: number,
	height?: number,
): void {
	ctx.drawImage(
		sheet.image,
		xIndex * sheet.frameWidth,
		yIndex * sheet.frameHeight,
		sheet.frameWidth,
		sheet.frameHeight,
		x,
		y,
		width || sheet.frameWidth,
		height || sheet.frameHeight,
	);
}

export function playAnimation(
	ctx: CanvasRenderingContext2D,
	animation: SpriteAnimation,
	x: number,
	y: number,
	delta: number,
): void {
	const sheet = spriteSheetMap.get(animation.src)!;

	if ((animation.frameDelta += delta) > animation.frameTime) {
		animation.frameDelta = 0;
		if ((animation.xIndex += 1) >= sheet.xFrames) {
			animation.xIndex = 0;
		}
	}

	drawSprite(ctx, sheet, animation.xIndex, animation.yIndex, x, y);
}
