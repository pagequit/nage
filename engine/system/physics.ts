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

function bufferNext(buffer: CollisionBuffer): Collision {
	return buffer.pool[buffer.cursor++ & buffer.mask];
}

function bufferSliceReset(buffer: CollisionBuffer): void {
	buffer.slice.length = 0;
}

function bufferSliceAdd(buffer: CollisionBuffer): Collision {
	const next = bufferNext(buffer);
	buffer.slice.push(next);

	return next;
}

export type Collider = {
	shape: ShapeType;
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

function createCollision(): Collision {
	return {
		cid: "",
		normal: createVector(),
		position: createVector(),
		depth: 0,
		angle: 0,
	};
}

export function createCollider(
	shape: ShapeType,
	body: Circle | Rect | Polygon,
	bufferSize: number = 8,
): Collider {
	return {
		shape,
		body,
		buffer: createCollisionBuffer(bufferSize),
	};
}

export function moveAndCollide(
	id: string,
	velocity: Vector,
	delta: number,
): Array<Collision> {
	const colliders = $<Collider>("collider")!;
	const self = colliders.get(id)!.value;
	bufferSliceReset(self.buffer);

	for (const [cid, _] of colliders.entries()) {
		if (cid === id) {
			continue;
		}
		const collisoin = bufferSliceAdd(self.buffer);
		collisoin.cid = cid;
	}

	return self.buffer.slice;
}
