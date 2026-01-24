import charIdle from "#/assets/char-idle.png";
import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import { fromSrc, type Sprite } from "#/lib/Sprite.ts";

const idle: Sprite = await fromSrc(charIdle, 2, 4);

const { animate, process } = defineEntity("hero", {
	animation: createAnimation(idle, 500, 2),
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
	if (pointer.isDown) {
		entity.position.x = pointer.position.x;
		entity.position.y = pointer.position.y;
	}

	entity.position.x -= keyboardInput.arrowLeft ? 1 : 0;
	entity.position.x += keyboardInput.arrowRight ? 1 : 0;
	entity.position.y -= keyboardInput.arrowUp ? 1 : 0;
	entity.position.y += keyboardInput.arrowDown ? 1 : 0;
});
