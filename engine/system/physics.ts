import type { Circle } from "#/engine/Circle.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import { createRect, fillRect, type Rect, strokeRect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import { viewport } from "#/engine/Viewport.ts";

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

type Collide = (
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) => void;

export type Collider = {
	shape: Shape;
	body: Circle | Rect | Polygon;
	aabb: Rect;
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
	let aabb = createRect(createVector(), 0, 0);
	switch (shape) {
		case CIRCLE: {
			const radius = (body as Circle).radius;
			const size = radius * 2;

			aabb.width = size;
			aabb.height = size;
			aabb.position.x = body.position.x - radius;
			aabb.position.y = body.position.y - radius;
			break;
		}
		case RECT: {
			aabb = body as Rect;
			break;
		}
		case POLYGON: {
			break;
		}
	}

	return {
		shape,
		body,
		aabb,
		buffer: createCollisionBuffer(bufferSize),
	};
}

const inflAABB = createRect(createVector(), 0, 0);
function sweptAABB(
	self: Collider,
	velocity: Vector,
	other: Collider,
): null | number {
	inflAABB.position.x = other.aabb.position.x - self.aabb.width;
	inflAABB.position.y = other.aabb.position.y - self.aabb.height;
	inflAABB.width = other.aabb.width + self.aabb.width;
	inflAABB.height = other.aabb.height + self.aabb.height;

	let txNear = (inflAABB.position.x - self.aabb.position.x) / velocity.x;
	let txFar =
		(inflAABB.position.x + inflAABB.width - self.aabb.position.x) / velocity.x;

	let tyNear = (inflAABB.position.y - self.aabb.position.y) / velocity.y;
	let tyFar =
		(inflAABB.position.y + inflAABB.height - self.aabb.position.y) / velocity.y;

	if (txNear > txFar) {
		[txNear, txFar] = [txFar, txNear];
	}
	if (tyNear > tyFar) {
		[tyNear, tyFar] = [tyFar, tyNear];
	}

	// no collision at all
	if (txNear > tyFar || tyNear > txFar) {
		return null;
	}

	const thNear = Math.max(txNear, tyNear);
	const thFar = Math.min(txFar, tyFar);

	// thMax < 0, collision is behind a frame
	// thMin > 1, collision is ahead a frame
	if (thFar < 0 || thNear > 1) {
		return null;
	}

	return thNear;
}

function collideWithCirle(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
	collision.cid = cid;
}

function collideWithRect(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
	const th = sweptAABB(self, velocity, other);
	collision.cid = th !== null ? cid : "";
}

function collideWithPolygon(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
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
	const positions = $<Vector>("position")!;

	const self = colliders.get(id)!.value;
	const pos = positions.get(id)!.value;

	self.aabb.position.x = pos.x;
	self.aabb.position.y = pos.y;

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
				circleCollide[other.shape](collision, cid, self, velocity, other);
				break;
			}
			case RECT: {
				rectCollide[other.shape](collision, cid, self, velocity, other);
				break;
			}
			case POLYGON: {
				polygonCollide[other.shape](collision, cid, self, velocity, other);
				break;
			}
		}

		if (collision.cid.length > 0) {
			slice.push(collision);
		}
	}

	return slice;
}
