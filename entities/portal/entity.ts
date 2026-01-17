import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { useEntity } from "#/engine/Entity.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const sprite: Sprite = await fromSrc("./assets/portal.png", 3, 1);

const { animate } = useEntity(import.meta, {
	animation: createAnimation(sprite, 400, 0),
});

animate((entity, ctx, delta) => {
	playAnimation(
		ctx,
		entity.animation,
		entity.position.x,
		entity.position.y,
		delta,
	);
});
