import type { Circle } from "#/engine/Circle.ts";
import type MapProxy from "#/engine/lib/MapProxy.ts";
import RingBuffer from "#/engine/lib/RingBuffer.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import type { Rect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";

const CIRCLE = 0;
const RECT = 1;
const POLYGON = 2;

type Shape = 0 | 1 | 2;

export type Collider = {
	shape: Shape;
	collision: Collision;
};

export type Collision = {
	id: string;
};

export function createCollider(shape: Shape): Collider {
	return {
		shape,
		collision: { id: "" },
	};
}

const collisions = new RingBuffer(128, {
	id: "",
	normal: createVector(),
});

export function moveAndCollide(
	id: string,
	velocity: Vector,
	delta: number,
): void {
	const colliders = $<Collider>("collider")!;

	for (const [oid, _] of colliders.entries()) {
		if (oid === id) {
			continue;
		}

		const self = colliders.get(id)!.value;
		self.collision.id = oid;
	}
}
