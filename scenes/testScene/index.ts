import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, preProcess, linkScenes } = useScene(data);

linkScenes(["fooScene", "fuzzScene"] as const);

preProcess(() => {});

process((_ctx, _delta) => {});
