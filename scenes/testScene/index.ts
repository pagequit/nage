import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, linkScenes } = useScene(data);

linkScenes(["fooScene"] as const);

process((_ctx, _delta) => {});
