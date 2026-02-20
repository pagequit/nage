import { strokeCircle } from "#/engine/Circle.ts";
import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import { spriteSheetMap } from "#/engine/Sprite.ts";
import type { Hero } from "#/game/entities/hero/entity.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess((entityInstanceMap) => {
	const entry = entityInstanceMap.get("hero")!;
	const instance = entry.instances[0] as Hero;
	const sheet = spriteSheetMap.get(instance.animation.src)!;

	instance.position.x = data.width - sheet.frameHeight;
	instance.position.y = data.height - sheet.frameWidth;
});

process((ctx, _delta) => {
	if (!pointer.isDown) {
		strokeCircle(ctx, {
			position: pointer.position,
			radius: 4,
		});
	}
});
