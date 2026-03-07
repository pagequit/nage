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
	velocity: createVector(),
});

process((id, delta) => {
	const position = $<Vector>("position").get(id)!;
	const velocity = $<Vector>("velocity").get(id)!;

	if (pointer.isDown) {
		position.value.x = pointer.position.x;
		position.value.y = pointer.position.y;
	}

	velocity.value.x -= keyboardInput.arrowLeft ? speed : 0;
	velocity.value.x += keyboardInput.arrowRight ? speed : 0;
	velocity.value.y -= keyboardInput.arrowUp ? speed : 0;
	velocity.value.y += keyboardInput.arrowDown ? speed : 0;

	position.value.x = Math.round(velocity.value.x * delta + position.value.x);
	position.value.y = Math.round(velocity.value.y * delta + position.value.y);

	velocity.value.x = 0;
	velocity.value.y = 0;
});
