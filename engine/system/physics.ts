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

type CollisionBuffer = {
	size: number;
	mask: number;
	cursor: number;
	pool: Array<Collision>;
	slice: Array<Collision>;
};

type Collide = (collision: Collision, cid: string) => void;

export type Collider = {
	shape: Shape;
	body: Circle | Rect | Polygon;
	buffer: CollisionBuffer;
};

export type Collision = {
	cid: string;
	normal: Vector;
	position: Vector;
	depth: 0;
	angle: 0;
};

export function createCollider(
	shape: Shape,
	body: Circle | Rect | Polygon,
	bufferSize: number = 8,
): Collider {
	return {
		shape,
		body,
		buffer: createCollisionBuffer(bufferSize),
	};
}

function collideWithCirle(collision: Collision, cid: string) {
	collision.cid = cid;
}

function collideWithRect(collision: Collision, cid: string) {
	collision.cid = cid;
}

function collideWithPolygon(collision: Collision, cid: string) {
	collision.cid = cid;
}

const circleCollide: Array<Collide> = [
	collideWithCirle,
	collideWithRect,
	collideWithPolygon,
];

const rectCollide: Array<Collide> = [
	collideWithCirle,
	collideWithRect,
	collideWithPolygon,
];

const polygonCollide: Array<Collide> = [
	collideWithCirle,
	collideWithRect,
	collideWithPolygon,
];

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

function createCollision(): Collision {
	return {
		cid: "",
		normal: createVector(),
		position: createVector(),
		depth: 0,
		angle: 0,
	};
}

export function moveAndCollide(
	id: string,
	velocity: Vector,
	delta: number,
): Array<Collision> {
	const colliders = $<Collider>("collider")!;
	const self = colliders.get(id)!.value;
	const slice = self.buffer.slice;
	slice.length = 0;

	for (const [cid, collider] of colliders.entries()) {
		if (cid === id) {
			continue;
		}

		const other = collider.value;
		const collision = next(self.buffer);
		switch (self.shape) {
			case CIRCLE: {
				circleCollide[other.shape](collision, cid);
				break;
			}
			case RECT: {
				rectCollide[other.shape](collision, cid);
				break;
			}
			case POLYGON: {
				polygonCollide[other.shape](collision, cid);
				break;
			}
		}

		if (collision.cid.length > 0) {
			slice.push(collision);
		}
	}

	return slice;
}
