import { type EntityInstance, loadEntity } from "#/engine/Entity.ts";
import { useScene } from "#/engine/Scene.ts";
import { drawSprite } from "#/lib/Sprite.ts";
import data from "./data.json";

const { process } = useScene(data);

const entities: Array<EntityInstance> = [];
for (const entity of data.entities) {
	const instance = await loadEntity(entity);
	entities.push(instance);
}

process((ctx, _delta) => {
	for (const instance of entities) {
		drawSprite(ctx, instance.sprite, 0, 0, 16, 16);
	}
});
