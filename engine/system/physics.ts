import type { Circle } from "#/engine/Circle.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import type { Rect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";

export enum Shape {
	Cirle,
	Rect,
	Polygon,
}

const CIRCLE = Shape.Cirle;
const RECT = Shape.Rect;
const POLYGON = Shape.Polygon;

type ShapeType = Shape.Cirle | Shape.Rect | Shape.Polygon;

type CollisionBuffer = {
	size: number;
	mask: number;
	cursor: number;
	pool: Array<Collision>;
	slice: Array<Collision>;
};

function createCollisionBuffer(size: number): CollisionBuffer {
	if ((size & (size - 1)) !== 0) {
		throw new Error("size must be a power of two");
	}

	const pool: Array<Collision> = [];
	for (let i = 0; i < size; i++) {
		pool.push(createCollision());
	}

	return {
		size,
		mask: size - 1,
		cursor: 0,
		pool,
		slice: [],
	};
}

function next(buffer: CollisionBuffer): Collision {
	return buffer.pool[buffer.cursor++ & buffer.mask];
}

export type Collision = {
	cid: string;
	normal: Vector;
	position: Vector;
	depth: 0;
	angle: 0;
};

function createCollision(): Collision {
	return {
		cid: "",
		normal: createVector(),
		position: createVector(),
		depth: 0,
		angle: 0,
	};
}

export class Collider {
	shapeType: ShapeType;
	body: Circle | Rect | Polygon;
	buffer: CollisionBuffer;

	constructor(
		shape: ShapeType,
		body: Circle | Rect | Polygon,
		bufferSize: number = 8,
	) {
		this.shapeType = shape;
		this.body = body;
		this.buffer = createCollisionBuffer(bufferSize);
	}

	// FIXME: sTruCtUrEd ClOnE >.<
	collideWithCircle(collision: Collision, cid: string): void {
		collision.cid = cid;
	}
}

export function moveAndCollide(
	id: string,
	velocity: Vector,
	delta: number,
): Array<Collision> {
	const colliders = $<Collider>("collider")!;
	const self = colliders.get(id)!;
	console.log(id, self);
	const slice = self.value.buffer.slice;
	slice.length = 0;

	for (const [cid, collider] of colliders.entries()) {
		if (cid === id) {
			continue;
		}

		const collision = next(self.value.buffer);
		switch (collider.value.shapeType) {
			case CIRCLE: {
				// FIXME: sTruCtUrEd ClOnE >.<
				self.value.collideWithCircle(collision, cid);
				break;
			}
			case RECT: {
				break;
			}
			case POLYGON: {
				break;
			}
		}
		if (collision.cid.length > 0) {
			slice.push(collision);
		}
	}

	return slice;
}
