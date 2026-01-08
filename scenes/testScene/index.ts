import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = useScene(data);

linkScenes(["fooScene", "fuzzScene"] as const);

preProcess((entityInstanceMap) => {
	const entity = entityInstanceMap.get(data.entities[0].name);
	const instance = entity!.instances[0];

	instance.position.x = data.width - 16;
	instance.position.y = data.height - 16;
});

process((_ctx, _delta) => {});
