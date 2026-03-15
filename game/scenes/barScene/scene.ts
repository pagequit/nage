import { createPolygon, type Polygon } from "#/engine/Polygon.ts";
import { defineScene } from "#/engine/Scene.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import data from "./data.json";

const { process, linkScenes } = defineScene(data);

linkScenes(["testScene"] as const);

const polygon = createPolygon(createVector(32, 32), [
	createVector(0, 0),
	createVector(0, 16),
	createVector(16, 16),
]);

function drawPoint(
	ctx: CanvasRenderingContext2D,
	position: Vector,
	radius: number = 2,
	color: string = "#fff",
): void {
	ctx.beginPath();
	ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function drawPoly(
	ctx: CanvasRenderingContext2D,
	poly: Polygon,
	trigger: boolean = false,
): void {
	drawPoint(ctx, poly.position);
	ctx.beginPath();
	ctx.moveTo(
		poly.points[0].x + poly.position.x + 0.5,
		poly.points[0].y + poly.position.y + 0.5,
	);

	for (let i = poly.points.length - 1; i >= 0; i--) {
		ctx.lineTo(
			poly.points[i].x + poly.position.x + 0.5,
			poly.points[i].y + poly.position.y + 0.5,
		);
	}

	ctx.strokeStyle = trigger ? "red" : "orange";
	ctx.stroke();
}

process((ctx, _delta) => {
	drawPoly(ctx, polygon);
});
