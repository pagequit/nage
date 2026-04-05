import type { Vector } from "#/engine/Vector.ts";

export type Rect = {
	width: number;
	height: number;
};

export function createRect(width: number, height: number): Rect {
	return {
		width,
		height,
	};
}

export function fromMinMax(min: Vector, max: Vector): Rect {
	return {
		width: max.x - min.x,
		height: max.y - min.y,
	};
}

export function strokeRect(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	x: number,
	y: number,
	color: string = "#fff",
	alpha: number = 1.0,
	lineWidth: number = 1,
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.lineWidth = lineWidth;
	ctx.strokeRect(x + 0.5, y + 0.5, rect.width - 1, rect.height - 1);
	ctx.restore();
}

export function fillRect(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	x: number,
	y: number,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.fillStyle = color;
	ctx.globalAlpha = alpha;
	ctx.fillRect(x, y, rect.width, rect.height);
	ctx.restore();
}
