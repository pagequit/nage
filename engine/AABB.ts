import { copyVector, type Vector } from "#/engine/Vector.ts";

export type AABB = {
	position: Vector;
	width: number;
	height: number;
};

export function createAABB(
	position: Vector,
	width: number,
	height: number,
): AABB {
	return {
		position,
		width,
		height,
	};
}

export function fromMinMax(min: Vector, max: Vector): AABB {
	return {
		position: copyVector(min),
		width: max.x - min.x,
		height: max.y - min.y,
	};
}

export function drawAABB(
	ctx: CanvasRenderingContext2D,
	aabb: AABB,
	color: string = "#fff",
): void {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.strokeRect(
		aabb.position.x - 0.5,
		aabb.position.y - 0.5,
		aabb.width,
		aabb.height,
	);
	ctx.restore();
}
