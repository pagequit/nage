import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process, linkScenes } = useScene(data);

// const changeScene = linkScenes(["testScene"] as const);

// changeScene("testScene");

process((_ctx, _delta) => {});
