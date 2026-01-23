import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const idle: Sprite = await fromSrc("/assets/hero/idle.png", 5, 4);

const { animate, process } = defineEntity("barEntity", {
	animation: createAnimation(idle, 200, 0),
	stuff: 1,
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

process((entity, delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > 64) {
		entity.stuff = -1;
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
	}
});
