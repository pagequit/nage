import { createCircle, strokeCircle } from "#/engine/Circle.ts";
import { pointer } from "#/engine/Pointer.ts";
import { defineScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, preProcess, postProcess, linkScenes } = defineScene(data);

linkScenes(["fooScene"] as const);

preProcess(() => {
	console.log("pre: ", data.name);
});

postProcess(() => {
	console.log("post: ", data.name);
});

const cirle = createCircle(4);

process((ctx, _delta) => {
	if (!pointer.isDown) {
		strokeCircle(ctx, cirle, pointer.position.x, pointer.position.y);
	}
});
