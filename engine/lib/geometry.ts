import type { Circle } from "#/engine/Circle.ts";
import type { Rect } from "#/engine/Rect";
import type { Vector } from "#/engine/Vector.ts";

export function isPointInCircle(point: Vector, circle: Circle): boolean {
	const dx = point.x - circle.position.x;
	const dy = point.y - circle.position.y;

	return dx * dx + dy * dy <= circle.radius ** 2;
}

export function isPointInRect(point: Vector, rect: Rect): boolean {
	const rx = rect.position.x;
	const ry = rect.position.y;

	return (
		point.x >= rx &&
		point.x <= rx + rect.width &&
		point.y >= ry &&
		point.y <= ry + rect.height
	);
}

export function circleIntersectCircle(a: Circle, b: Circle): boolean {
	const dx = a.position.x - b.position.x;
	const dy = a.position.y - b.position.y;

	return dx * dx + dy * dy <= (a.radius + b.radius) ** 2;
}

export function RectIntersectRect(a: Rect, b: Rect): boolean {
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

export function circleIntersectRect(circle: Circle, rect: Rect): boolean {
	const cx = circle.position.x;
	const cy = circle.position.y;
	const rx = rect.position.x;
	const ry = rect.position.y;

	const dx = cx - Math.max(rx, Math.min(cx, rx + rect.width));
	const dy = cy - Math.max(ry, Math.min(cy, ry + rect.height));

	return dx * dx + dy * dy <= circle.radius ** 2;
}

export function circleContainsCircle(a: Circle, b: Circle): boolean {
	const dx = a.position.x - b.position.x;
	const dy = a.position.y - b.position.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	return a.radius >= b.radius + distance;
}

export function RectContainsRect(a: Rect, b: Rect): boolean {
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

export function RectContainsCircle(rect: Rect, circle: Circle): boolean {
	const rx = rect.position.x;
	const ry = rect.position.y;
	const cx = circle.position.x;
	const cy = circle.position.y;

	return (
		rx <= cx - circle.radius &&
		rx + rect.width >= cx + circle.radius &&
		ry <= cy - circle.radius &&
		ry + rect.height >= cy + circle.radius
	);
}

export function circleContainsRect(circle: Circle, rect: Rect): boolean {
	const radSquare = circle.radius ** 2;

	const dax = rect.position.x - circle.position.x;
	const day = rect.position.y - circle.position.y;
	if (dax * dax + day * day > radSquare) {
		return false;
	}

	const dbx = rect.position.x + rect.width - circle.position.x;
	const dby = rect.position.y - circle.position.y;
	if (dbx * dbx + dby * dby > radSquare) {
		return false;
	}

	const dcx = rect.position.x - circle.position.x;
	const dcy = rect.position.y + rect.height - circle.position.y;
	if (dcx * dcx + dcy * dcy > radSquare) {
		return false;
	}

	const ddx = rect.position.x + rect.width - circle.position.x;
	const ddy = rect.position.y + rect.height - circle.position.y;
	if (ddx * ddx + ddy * ddy > radSquare) {
		return false;
	}

	return true;
}
