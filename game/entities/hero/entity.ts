// import { createCircle } from "#/engine/Circle.ts";
// import { moveAndCollide } from "#/engine/Collision.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import $ from "#/engine/Scene.ts";
import {
	createSprite,
	createSpritePlayback,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import charIdle from "#/game/assets/char-idle.png";

const speed = 0.05;
const idleSrc = await defineSpriteSheet(charIdle, 2, 4);

const process = defineEntity("hero", {
	position: createVector(),
	sprite: createSprite(idleSrc),
	playback: createSpritePlayback(500, 2),
	// body: createCircle(createVector(), 4),
	velocity: createVector(),
});

process((id, delta) => {
	const position = $<Vector>("position").get(id)!;
	const velocity = velocityMap.get(id)!;
	// const body = bodyMap.get(id);

	if (pointer.isDown) {
		position.x = pointer.position.x;
		position.y = pointer.position.y;
	}

	velocity.x -= keyboardInput.arrowLeft ? speed : 0;
	velocity.x += keyboardInput.arrowRight ? speed : 0;
	velocity.y -= keyboardInput.arrowUp ? speed : 0;
	velocity.y += keyboardInput.arrowDown ? speed : 0;

	// const collision = moveAndCollide(body, velocity, delta);
	// slideOnCollision(velocity, collision);
	// slide(velocity, collision.normal);

	position.x = Math.round(velocity.x * delta + position.x);
	position.y = Math.round(velocity.y * delta + position.y);

	velocity.x = 0;
	velocity.y = 0;
});
