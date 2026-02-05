import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { fromSrc, type Sprite } from "#/engine/Sprite.ts";
import portal from "#/game/assets/portal.png";

const sprite: Sprite = await fromSrc(portal, 3, 1);

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
