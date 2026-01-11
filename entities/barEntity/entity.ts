import { useEntity } from "#/engine/Entity.ts";
import { animateSprite, createAnimation } from "#/lib/Animation.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const idle: Sprite = await fromSrc("/assets/hero/idle.png", 5, 4);

const { animate, process } = useEntity(import.meta, {
	animation: createAnimation(0, 200),
	stuff: 1,
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

process((entity, delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > 64) {
		entity.stuff = -1;
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
	}
});
