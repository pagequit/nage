import type { Circle } from "#/engine/Circle.ts";
import $ from "#/engine/Scene.ts";
import type { Vector } from "#/engine/Vector.ts";

const CIRCLE = 0;
const RECT = 1;
const POLYGON = 2;

type Shape = 0 | 1 | 2;

export type Collider<T> = {
	shape: Shape;
	body: T;
};

export type Collision = {};

export function moveAndCollide<T>(
	collider: Collider<T>,
	velocity: Vector,
	delta: number,
): Collision {
	return {};
}

export function processPhysics(
	ctx: CanvasRenderingContext2D,
	delta: number,
): void {
	for (const [id, collider] of $<Collider<unknown>>("collider")!.entries()) {
		const position = $<Vector>("position")!.get(id);
	}
}
