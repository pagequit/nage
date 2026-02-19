export type SpritesSheet = {
	image: HTMLImageElement;
	xFrames: number;
	yFrames: number;
	frameWidth: number;
	frameHeight: number;
};

export type SpriteAnimation = {
	sheet: SpritesSheet;
	xIndex: number;
	yIndex: number;
	frameTime: number;
	frameDelta: number;
};

export function createSpritesSheet(
	image: HTMLImageElement,
	xFrames: number,
	yFrames: number,
): SpritesSheet {
	return {
		image,
		xFrames,
		yFrames,
		frameWidth: image.width / xFrames,
		frameHeight: image.height / yFrames,
	};
}

export function createSpriteAnimation(
	sheet: SpritesSheet,
	frameTime: number,
	yIndex: number,
): SpriteAnimation {
	return {
		sheet,
		xIndex: 0,
		yIndex,
		frameTime,
		frameDelta: 0,
	};
}

export function drawSprite(
	ctx: CanvasRenderingContext2D,
	sheet: SpritesSheet,
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
	if ((animation.frameDelta += delta) > animation.frameTime) {
		animation.frameDelta = 0;
		if ((animation.xIndex += 1) >= animation.sheet.xFrames) {
			animation.xIndex = 0;
		}
	}

	drawSprite(ctx, animation.sheet, animation.xIndex, animation.yIndex, x, y);
}
