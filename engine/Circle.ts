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

export function drawCircle(
	ctx: CanvasRenderingContext2D,
	circle: Circle,
	color: string = "#fff",
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}
