import { defineScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, linkScenes } = defineScene(data);

linkScenes(["barScene"] as const);

process((_ctx, _delta) => {});
