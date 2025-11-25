import { createEntity } from "#/engine/Entity.ts";
import data from "./data.json";

export default createEntity(data.id, data.src, data.width, data.height);
