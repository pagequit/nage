import { createVector, type Vector } from "#/engine/Vector.ts";

export type Polygon = {
	position: Vector;
	points: Array<Vector>;
	axes: Array<Vector>;
};

export function createPolygon(
	position: Vector,
	points: Array<Vector>,
): Polygon {
	const axes = points.map(() => createVector());
	const polygon = { position, points, axes };
	updateAxes(polygon);

	return polygon;
}

export function updateAxes({ points, axes }: Polygon): void {
	const cap = axes.length - 1;
	const p0 = points[0];
	let pi = p0;

	for (let i = 0; i < cap; i++) {
		const pj = points[i + 1];

		const nx = -(pj.y - pi.y);
		const ny = pj.x - pi.x;

		const invLen = 1.0 / Math.sqrt(nx * nx + ny * ny);

		const axis = axes[i];
		axis.x = nx * invLen;
		axis.y = ny * invLen;

		pi = pj;
	}

	const nx = -(p0.y - pi.y);
	const ny = p0.x - pi.x;

	const invLen = 1.0 / Math.sqrt(nx * nx + ny * ny);

	const axis = axes[cap];
	axis.x = nx * invLen;
	axis.y = ny * invLen;
}
