import { drawCircle } from "#/engine/Circle";
import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess((entityInstanceMap) => {
	const entity = entityInstanceMap.get(data.entities[0].name);
	const instance = entity!.instances[0];

	instance.position.x = data.width - 16;
	instance.position.y = data.height - 16;
});

process((ctx, delta) => {
	if (!pointer.isDown) {
		drawCircle(ctx, {
			position: pointer.position,
			radius: 4,
		});
	}
});
