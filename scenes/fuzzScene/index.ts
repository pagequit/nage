import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, linkScenes } = useScene(data);

linkScenes(["testScene"] as const);

process((_ctx, _delta) => {});
