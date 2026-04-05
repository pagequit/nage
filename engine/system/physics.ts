import type { Circle } from "#/engine/Circle.ts";
import type { Polygon } from "#/engine/Polygon.ts";
import type { Rect } from "#/engine/Rect.ts";
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
	colliderA: Collider,
	positionA: Vector,
	velocityA: Vector,
	colliderB: Collider,
	positionB: Vector,
) => void;

export type Collider = {
	shape: Shape;
	body: Circle | Rect | Polygon;
	buffer: CollisionBuffer;
	offset: Vector;
	width: number;
	height: number;
};

export type Collision = {
	cid: string;
	normal: Vector;
	time: number;
};

export function createCollider(
	shape: Shape,
	body: Circle | Rect | Polygon,
	offset?: Vector,
	bufferSize: number = 8,
): Collider {
	let width = 0;
	let height = 0;

	switch (shape) {
		case CIRCLE: {
			const radius = (body as Circle).radius;
			const size = radius * 2;

			width = size;
			height = size;
			if (offset === undefined) {
				offset = createVector();
			}
			break;
		}
		case RECT: {
			width = (body as Rect).width;
			height = (body as Rect).height;
			if (offset === undefined) {
				offset = createVector(-(width / 2), -(height / 2));
			}
			break;
		}
		case POLYGON: {
			// TODO
			if (offset === undefined) {
				offset = createVector();
			}
			break;
		}
	}

	return {
		shape,
		body,
		buffer: createCollisionBuffer(bufferSize),
		offset,
		width,
		height,
	};
}

const inflAABB = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
};
function sweptAABB(
	colliderA: Collider,
	positionA: Vector,
	velocityA: Vector,
	colliderB: Collider,
	positionB: Vector,
	delta: number,
): null | number {
	inflAABB.x = positionB.x - colliderA.width;
	inflAABB.y = positionB.y - colliderA.height;
	inflAABB.width = colliderB.width + colliderA.width;
	inflAABB.height = colliderB.height + colliderA.height;

	const disX = velocityA.x * delta;
	const disY = velocityA.y * delta;

	let txNear = (inflAABB.x - positionA.x) / disX;
	let txFar = (inflAABB.x + inflAABB.width - positionA.x) / disX;

	let tyNear = (inflAABB.y - positionA.y) / disY;
	let tyFar = (inflAABB.y + inflAABB.height - positionA.y) / disY;

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
	colliderA: Collider,
	positionA: Vector,
	velocityA: Vector,
	colliderB: Collider,
	positionB: Vector,
) {
	collision.cid = cid;
	// TODO
}

function collideWithRect(
	collision: Collision,
	cid: string,
	colliderA: Collider,
	positionA: Vector,
	velocityA: Vector,
	colliderB: Collider,
	positionB: Vector,
) {
	collision.cid = cid;
	const x = positionA.x - positionB.x;
	const y = positionA.y - positionB.y;
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
	colliderA: Collider,
	positionA: Vector,
	velocityA: Vector,
	colliderB: Collider,
	positionB: Vector,
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
	const positions = $<Vector>("position")!;
	const selfColl = colliders.get(id)!.value;
	const selfPos = positions.get(id)!.value;

	const slice = selfColl.buffer.slice;
	slice.length = 0;

	for (const [cid, collider] of colliders.entries()) {
		if (cid === id) {
			continue;
		}

		const otherColl = collider.value;
		const otherPos = positions.get(cid)!.value;
		const tHit = sweptAABB(
			selfColl,
			selfPos,
			velocity,
			otherColl,
			otherPos,
			delta,
		);
		if (tHit === null) {
			continue;
		}

		const collision = next(selfColl.buffer);
		collision.time = tHit;
		switch (selfColl.shape) {
			case CIRCLE: {
				circleCollide[otherColl.shape](
					collision,
					cid,
					selfColl,
					selfPos,
					velocity,
					otherColl,
					otherPos,
				);
				break;
			}
			case RECT: {
				rectCollide[otherColl.shape](
					collision,
					cid,
					selfColl,
					selfPos,
					velocity,
					otherColl,
					otherPos,
				);
				break;
			}
			case POLYGON: {
				polygonCollide[otherColl.shape](
					collision,
					cid,
					selfColl,
					selfPos,
					velocity,
					otherColl,
					otherPos,
				);
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

		const scale = Math.max(0, time - 0.001);
		position.x += velocity.x * delta * timeLeft * scale;
		position.y += velocity.y * delta * timeLeft * scale;

		const dot = getDotProduct(velocity, closest.normal);
		velocity.x -= closest.normal.x * dot;
		velocity.y -= closest.normal.y * dot;

		timeLeft *= 1 - time;
	}

	velocity.x *= timeLeft;
	velocity.y *= timeLeft;
}
