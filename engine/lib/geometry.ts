import type { AABB } from "#/engine/AABB.ts";
import type { Circle } from "#/engine/Circle.ts";
import type { Vector } from "#/engine/Vector.ts";

export function isPointInCircle(point: Vector, circle: Circle): boolean {
	const dx = point.x - circle.position.x;
	const dy = point.y - circle.position.y;

	return dx * dx + dy * dy <= circle.radius ** 2;
}

export function isPointInAABB(point: Vector, aabb: AABB): boolean {
	const rx = aabb.position.x;
	const ry = aabb.position.y;

	return (
		point.x >= rx &&
		point.x <= rx + aabb.width &&
		point.y >= ry &&
		point.y <= ry + aabb.height
	);
}

export function circleIntersectCircle(a: Circle, b: Circle): boolean {
	const dx = a.position.x - b.position.x;
	const dy = a.position.y - b.position.y;

	return dx * dx + dy * dy <= (a.radius + b.radius) ** 2;
}

export function AABBIntersectAABB(a: AABB, b: AABB): boolean {
	const ax = a.position.x;
	const ay = a.position.y;
	const bx = b.position.x;
	const by = b.position.y;

	return (
		ax <= bx + b.width &&
		ax + a.width >= bx &&
		ay <= by + b.height &&
		ay + a.height >= by
	);
}

export function circleIntersectAABB(circle: Circle, aabb: AABB): boolean {
	const cx = circle.position.x;
	const cy = circle.position.y;
	const rx = aabb.position.x;
	const ry = aabb.position.y;

	const dx = cx - Math.max(rx, Math.min(cx, rx + aabb.width));
	const dy = cy - Math.max(ry, Math.min(cy, ry + aabb.height));

	return dx * dx + dy * dy <= circle.radius ** 2;
}

export function circleContainsCircle(a: Circle, b: Circle): boolean {
	const dx = a.position.x - b.position.x;
	const dy = a.position.y - b.position.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	return a.radius >= b.radius + distance;
}

export function AABBContainsAABB(a: AABB, b: AABB): boolean {
	const ax = a.position.x;
	const ay = a.position.y;
	const bx = b.position.x;
	const by = b.position.y;

	return (
		ax <= bx &&
		ax + a.width >= bx + b.width &&
		ay <= by &&
		ay + a.height >= by + b.height
	);
}

export function AABBContainsCircle(aabb: AABB, circle: Circle): boolean {
	const rx = aabb.position.x;
	const ry = aabb.position.y;
	const cx = circle.position.x;
	const cy = circle.position.y;

	return (
		rx <= cx - circle.radius &&
		rx + aabb.width >= cx + circle.radius &&
		ry <= cy - circle.radius &&
		ry + aabb.height >= cy + circle.radius
	);
}

export function circleContainsAABB(circle: Circle, aabb: AABB): boolean {
	const radiusSquare = circle.radius ** 2;

	const dax = aabb.position.x - circle.position.x;
	const day = aabb.position.y - circle.position.y;
	if (dax * dax + day * day > radiusSquare) {
		return false;
	}

	const dbx = aabb.position.x + aabb.width - circle.position.x;
	const dby = aabb.position.y - circle.position.y;
	if (dbx * dbx + dby * dby > radiusSquare) {
		return false;
	}

	const dcx = aabb.position.x - circle.position.x;
	const dcy = aabb.position.y + aabb.height - circle.position.y;
	if (dcx * dcx + dcy * dcy > radiusSquare) {
		return false;
	}

	const ddx = aabb.position.x + aabb.width - circle.position.x;
	const ddy = aabb.position.y + aabb.height - circle.position.y;
	if (ddx * ddx + ddy * ddy > radiusSquare) {
		return false;
	}

	return true;
}
