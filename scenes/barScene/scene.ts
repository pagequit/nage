import { defineScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, linkScenes } = defineScene(data);

linkScenes(["testScene"] as const);

process((_ctx, _delta) => {});
