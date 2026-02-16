import { createAnimation, playAnimation } from "#/engine/Animation.ts";
import { createCircle, drawCircle } from "#/engine/Circle";
import { moveAndCollide } from "#/engine/Collision.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import { fromSrc, type Sprite } from "#/engine/Sprite.ts";
import { createVector } from "#/engine/Vector.ts";
import charIdle from "#/game/assets/char-idle.png";

const idle: Sprite = await fromSrc(charIdle, 2, 4);

const { animate, process } = defineEntity("hero", {
	animation: createAnimation(idle, 500, 2),
	velocity: createVector(),
	body: {
		shape: createCircle(createVector(), 4),
		offset: createVector(8, 10),
	},
});

animate((entity, ctx, delta) => {
	playAnimation(
		ctx,
		entity.animation,
		entity.position.x,
		entity.position.y,
		delta,
	);
	drawCircle(ctx, entity.body.shape, "red");
});

process((entity, delta) => {
	if (pointer.isDown) {
		entity.position.x = pointer.position.x;
		entity.position.y = pointer.position.y;
	}

	entity.velocity.x -= keyboardInput.arrowLeft ? 0.1 : 0;
	entity.velocity.x += keyboardInput.arrowRight ? 0.1 : 0;
	entity.velocity.y -= keyboardInput.arrowUp ? 0.1 : 0;
	entity.velocity.y += keyboardInput.arrowDown ? 0.1 : 0;

	entity.position.x += entity.velocity.x * delta;
	entity.position.y += entity.velocity.y * delta;

	entity.velocity.x = 0;
	entity.velocity.y = 0;

	moveAndCollide(entity.body, entity.velocity);

	entity.body.shape.position.x = entity.body.offset.x + entity.position.x;
	entity.body.shape.position.y = entity.body.offset.y + entity.position.y;
});
