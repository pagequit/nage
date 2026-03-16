import { createVector, setEdgeNormal, type Vector } from "#/engine/Vector.ts";

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
		setEdgeNormal(axes[i], pi, pj);
		pi = pj;
	}

	setEdgeNormal(axes[cap], pi, p0);
}
