import type { Circle } from "#/engine/Circle.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import { createRect, type Rect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import { createVector, getDotProduct, type Vector } from "#/engine/Vector.ts";

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
	time: number;
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
			// TODO
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
	delta: number,
): null | number {
	inflAABB.position.x = other.aabb.position.x - self.aabb.width;
	inflAABB.position.y = other.aabb.position.y - self.aabb.height;
	inflAABB.width = other.aabb.width + self.aabb.width;
	inflAABB.height = other.aabb.height + self.aabb.height;

	const displacementX = velocity.x * delta;
	const displacementY = velocity.y * delta;

	let txNear = (inflAABB.position.x - self.aabb.position.x) / displacementX;
	let txFar =
		(inflAABB.position.x + inflAABB.width - self.aabb.position.x) /
		displacementX;

	let tyNear = (inflAABB.position.y - self.aabb.position.y) / displacementY;
	let tyFar =
		(inflAABB.position.y + inflAABB.height - self.aabb.position.y) /
		displacementY;

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

	// thFar < 0, collision is behind a frame
	// thNear > 1, collision is ahead a frame
	if (thFar < 0 || thNear > 1) {
		return null;
	}

	// -Infinity if velocity is 0
	return Math.max(0, thNear);
}

function collideWithCirle(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
	collision.cid = cid;
	// TODO
}

function collideWithRect(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
	collision.cid = cid;
	const x = self.aabb.position.x - other.aabb.position.x;
	const y = self.aabb.position.y - other.aabb.position.y;
	if (Math.abs(x) > Math.abs(y)) {
		collision.normal.y = 0;
		collision.normal.x = x > 0 ? 1 : -1;
	} else {
		collision.normal.x = 0;
		collision.normal.y = y > 0 ? 1 : -1;
	}
}

function collideWithPolygon(
	collision: Collision,
	cid: string,
	self: Collider,
	velocity: Vector,
	other: Collider,
) {
	collision.cid = cid;
	// TODO
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
		time: 0,
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
		const tHit = sweptAABB(self, velocity, other, delta);
		if (tHit === null) {
			continue;
		}

		const collision = next(self.buffer);
		collision.time = tHit;
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

export function moveAndSlide(
	id: string,
	velocity: Vector,
	delta: number,
): void {
	let timeLeft = 1;
	const aabb = $<Collider>("collider").get(id)!.value.aabb;
	const position = $<Vector>("position").get(id)!.value;

	for (let i = 0; i < 4; i++) {
		const collisions = moveAndCollide(id, velocity, delta);
		if (collisions.length < 1) {
			break;
		}

		let closest = collisions[0];
		for (const collision of collisions) {
			if (collision.time < closest.time) {
				closest = collision;
			}
		}

		const time = closest.time;
		if (time === -Infinity) {
			break; // TODO
		}

		const scale = Math.max(0, time - 0.001);
		aabb.position.x += velocity.x * (delta * timeLeft) * scale;
		aabb.position.y += velocity.y * (delta * timeLeft) * scale;

		const dot = getDotProduct(velocity, closest.normal);
		velocity.x -= closest.normal.x * dot;
		velocity.y -= closest.normal.y * dot;

		timeLeft *= 1 - time;
	}

	velocity.x *= timeLeft;
	velocity.y *= timeLeft;

	position.x = aabb.position.x;
	position.y = aabb.position.y;
}
