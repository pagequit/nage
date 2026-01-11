import charIdle from "#/assets/char-idle.png";
import { useEntity } from "#/engine/Entity.ts";
import { animateSprite, createAnimation } from "#/lib/Animation.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const idle: Sprite = await fromSrc(charIdle, 2, 4);

const { animate, process } = useEntity(import.meta, {
	animation: createAnimation(2, 500),
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
