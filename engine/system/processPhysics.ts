import type { Circle } from "#/engine/Circle.ts";
import type MapProxy from "#/engine/lib/MapProxy.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import type { Rect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import type { Vector } from "#/engine/Vector.ts";

const CIRCLE = 0;
const RECT = 1;
const POLYGON = 2;

type Shape = 0 | 1 | 2;

export type Collider = {
	shape: Shape;
};

export type Collision = {
	id: string;
};

const collisions = new Map<string, Collision>();

function check(
	id: string,
	collider: Collider,
	position: Vector,
	colliders: MapProxy<string, Collider>,
): string | undefined {
	for (const [oid, other] of colliders.entries()) {
		if (oid !== id && other) {
			return oid;
		}
	}
}

export function moveAndCollide(
	id: string,
	velocity: Vector,
	delta: number,
): Collision | undefined {
	return collisions.get(id);
}

export function processPhysics(
	ctx: CanvasRenderingContext2D,
	delta: number,
): void {
	const colliders = $<Collider>("collider")!;
	const positions = $<Vector>("position")!;

	for (const [id, collider] of colliders.entries()) {
		const position = positions.get(id)!;
		const target = check(id, collider.value, position.value, colliders);
		if (target !== undefined) {
			collisions.set(id, { id: target });
		} else {
			collisions.delete(id);
		}
	}
}
