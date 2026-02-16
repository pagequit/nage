import type { Vector } from "#/engine/Vector.ts";

export type Body<T extends { position: Vector }> = {
	shape: T;
	offset: Vector;
};

export function moveAndCollide<T extends { position: Vector }>(
	body: Body<T>,
	velocity: Vector,
): void {
	return;
}
