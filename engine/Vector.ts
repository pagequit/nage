export type Vector = {
	x: number;
	y: number;
};

export function createVector(x: number = 0, y: number = 0): Vector {
	return { x, y };
}

export function copyVector(vector: Vector): Vector {
	return { x: vector.x, y: vector.y };
}

export function fromPolar(angle: number, mag: number): Vector {
	return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
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

export function getDistanceSqrt(a: Vector, b: Vector): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;

	return dx * dx + dy * dy;
}

export function getSqrt(vector: Vector): number {
	return vector.x * vector.x + vector.y * vector.y;
}

export function setUnit(unit: Vector, a: Vector, b: Vector): void {
	invScale(unit, a.x - b.x, a.y - b.y);
}

export function setUnitNormal(unit: Vector, a: Vector, b: Vector): void {
	invScale(unit, a.y - b.y, b.x - a.x);
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
	invScale(vector, vector.x, vector.y);
}

export function invScale(vector: Vector, x: number, y: number): void {
	if (x === 0 && y === 0) {
		return;
	}

	const inv = 1.0 / Math.sqrt(x * x + y * y);
	vector.x = x * inv;
	vector.y = y * inv;
}

export function isZero(vector: Vector): boolean {
	return vector.x === 0 && vector.y === 0;
}

export function isBelowAbs(vector: Vector, abs: number): boolean {
	return Math.abs(vector.x) < abs && Math.abs(vector.y) < abs;
}

export function equals(a: Vector, b: Vector): boolean {
	return a.x === b.x && a.y === b.y;
}
