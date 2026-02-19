import { strokeCircle } from "#/engine/Circle.ts";
import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import type { Hero } from "#/game/entities/hero/entity.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess((entityInstanceMap) => {
	const entry = entityInstanceMap.get("hero")!;
	const instance = entry.instances[0] as Hero;

	instance.position.x = data.width - instance.animation.sheet.frameHeight;
	instance.position.y = data.height - instance.animation.sheet.frameWidth;
});

process((ctx, _delta) => {
	if (!pointer.isDown) {
		strokeCircle(ctx, {
			position: pointer.position,
			radius: 4,
		});
	}
});
