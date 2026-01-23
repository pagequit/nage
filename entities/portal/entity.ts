import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const sprite: Sprite = await fromSrc("./assets/portal.png", 3, 1);

const { animate } = defineEntity("portal", {
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
