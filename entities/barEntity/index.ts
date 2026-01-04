import { useEntity } from "#/engine/Entity.ts";
import { animateSprite, createAnimation } from "#/lib/Animation.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const idle: Sprite = await fromSrc("/assets/hero/idle.png", 5, 4);

const { animate, process } = useEntity("barEntity", {
	animation: createAnimation(0, 200),
});

animate((entity, ctx, delta) => {
	animateSprite(
		ctx,
		idle,
		entity.animation,
		entity.position.x,
		entity.position.y,
		delta,
	);
});

process((entity, delta) => {});
