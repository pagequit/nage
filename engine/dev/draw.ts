import type { Polygon } from "#/engine/Polygon.ts";
import type { Vector } from "#/engine/Vector.ts";

export function drawPoint(
	ctx: CanvasRenderingContext2D,
	position: Vector,
	radius: number = 1,
	color: string = "#fff",
): void {
	ctx.beginPath();
	ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

export function drawPolygon(
	ctx: CanvasRenderingContext2D,
	polygon: Polygon,
	color: string = "#fff",
): void {
	drawPoint(ctx, polygon.position);
	ctx.beginPath();
	ctx.moveTo(
		polygon.points[0].x + polygon.position.x,
		polygon.points[0].y + polygon.position.y,
	);

	for (let i = polygon.points.length - 1; i >= 0; i--) {
		ctx.lineTo(
			polygon.points[i].x + polygon.position.x,
			polygon.points[i].y + polygon.position.y,
		);
	}

	ctx.strokeStyle = color;
	ctx.stroke();
}
