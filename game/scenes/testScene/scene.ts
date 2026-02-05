import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import type { Vector } from "#/engine/Vector.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess((entityInstanceMap) => {
	const entity = entityInstanceMap.get(data.entities[0].name);
	const instance = entity!.instances[0];

	instance.position.x = data.width - 16;
	instance.position.y = data.height - 16;
});

function drawPoint(
	ctx: CanvasRenderingContext2D,
	position: Vector,
	radius: number = 4,
): void {
	ctx.beginPath();
	ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
	ctx.strokeStyle = "#ff9000";
	ctx.stroke();
}

process((ctx, delta) => {
	if (!pointer.isDown) {
		drawPoint(ctx, pointer.position);
	}
});
