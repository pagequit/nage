export type Vector = {
	x: number;
	y: number;
};

export function createVector(x: number = 0, y: number = 0): Vector {
	return { x, y };
}

export function copyVector(vector: Vector): Vector {
	return {
		x: vector.x,
		y: vector.y,
	};
}

export function fromPolar(angle: number, magnitude: number): Vector {
	return {
		x: Math.cos(angle) * magnitude,
		y: Math.sin(angle) * magnitude,
	};
}

export function getAngle(vector: Vector): number {
	return Math.atan2(vector.y, vector.x);
}

export function getMagnitude(vector: Vector): number {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export function getDistance(a: Vector, b: Vector): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;

	return Math.sqrt(dx * dx + dy * dy);
}

export function getDistanceSquared(a: Vector, b: Vector): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;

	return dx * dx + dy * dy;
}

export function getSquared(vector: Vector): number {
	return vector.x * vector.x + vector.y * vector.y;
}

export function setUnit(unit: Vector, a: Vector, b: Vector): void {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const inv = 1.0 / Math.sqrt(dx * dx + dy * dy);

	unit.x = dx * inv;
	unit.y = dy * inv;
}

export function setUnitNormal(unit: Vector, a: Vector, b: Vector): void {
	const nx = a.y - b.y;
	const ny = b.x - a.x;
	const inv = 1.0 / Math.sqrt(nx * nx + ny * ny);

	unit.x = nx * inv;
	unit.y = ny * inv;
}

export function getDotProduct(a: Vector, b: Vector): number {
	return a.x * b.x + a.y * b.y;
}

export function getPerpDotProduct(a: Vector, b: Vector): number {
	return a.x * b.x - a.y * b.y;
}

export function scale(vector: Vector, scalar: number): void {
	vector.x *= scalar;
	vector.y *= scalar;
}

export function normalize(vector: Vector): void {
	const inv = 1.0 / Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	vector.x *= inv;
	vector.y *= inv;
}

export function isZero(vector: Vector): boolean {
	return vector.x === 0 && vector.y === 0;
}

export function isBelowThreshold(vector: Vector, threshold: number): boolean {
	return Math.abs(vector.x) < threshold && Math.abs(vector.y) < threshold;
}

export function equals(a: Vector, b: Vector): boolean {
	return a.x === b.x && a.y === b.y;
}
