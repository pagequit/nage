import type { Vector } from "#/engine/Vector.ts";

export type Polygon = {
	position: Vector;
	points: Array<Vector>;
	axes: Array<Vector>;
};
