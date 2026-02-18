import { copyVector, type Vector } from "#/engine/Vector.ts";

export type Rect = {
	position: Vector;
	width: number;
	height: number;
};

export function createRect(
	position: Vector,
	width: number,
	height: number,
): Rect {
	return {
		position,
		width,
		height,
	};
}

export function fromMinMax(min: Vector, max: Vector): Rect {
	return {
		position: copyVector(min),
		width: max.x - min.x,
		height: max.y - min.y,
	};
}

export function strokeRect(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.strokeRect(
		rect.position.x - 0.5,
		rect.position.y - 0.5,
		rect.width,
		rect.height,
	);
	ctx.restore();
}

export function fillRect(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.fillRect(
		rect.position.x - 0.5,
		rect.position.y - 0.5,
		rect.width,
		rect.height,
	);
	ctx.restore();
}
