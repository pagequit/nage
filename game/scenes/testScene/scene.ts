import { createCircle, strokeCircle } from "#/engine/Circle.ts";
import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import { spriteSheetMap } from "#/engine/Sprite.ts";
import { createVector } from "#/engine/Vector";
import data from "./data.json";

const { process, preProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess((entityInstanceMap) => {
	const entry = entityInstanceMap.get("hero")!;
	const instance = entry.instances[0];
	// const sheet = spriteSheetMap.get(instance.animation.src)!;

	instance.position.x = data.width - 16;
	instance.position.y = data.height - 16;
});

const cirle = createCircle(createVector(), 4);
process((ctx, _delta) => {
	if (!pointer.isDown) {
		cirle.position.x = pointer.position.x;
		cirle.position.y = pointer.position.y;
		strokeCircle(ctx, cirle);
	}
});
