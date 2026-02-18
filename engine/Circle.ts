import type { Vector } from "#/engine/Vector.ts";

export type Circle = {
	position: Vector;
	radius: number;
};

export function createCircle(position: Vector, radius: number): Circle {
	return {
		position,
		radius,
	};
}

export function strokeCircle(
	ctx: CanvasRenderingContext2D,
	circle: Circle,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.globalAlpha = alpha;
	ctx.beginPath();
	ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}

export function fillCircle(
	ctx: CanvasRenderingContext2D,
	circle: Circle,
	color: string = "#fff",
	alpha: number = 1.0,
): void {
	ctx.save();
	ctx.fillStyle = color;
	ctx.globalAlpha = alpha;
	ctx.beginPath();
	ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.restore();
}
