import { useScene } from "#/engine/Scene.ts";
import data from "./data.json";

const { process } = useScene(data);

process((_ctx, _delta) => {});
