import $ from "#/engine/Scene.ts";
import type { Vector } from "#/engine/Vector.ts";

export type Collider = {};

export type Collision = {};

export function moveAndCollide(
	collider: Collider,
	velocity: Vector,
	delta: number,
): Collision {}

export function processPhysics(
	ctx: CanvasRenderingContext2D,
	delta: number,
): void {
	for (const [id, collider] of $<Collider>("collider")!.entries()) {
		const position = $<Vector>("position")!.get(id);
	}
}
