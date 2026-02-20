import { type Circle, createCircle } from "#/engine/Circle.ts";
import { moveAndCollide } from "#/engine/Collision.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import {
	createSpriteAnimation,
	type SpriteAnimation,
	useSpriteSheetSrc,
} from "#/engine/Sprite.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import charIdle from "#/game/assets/char-idle.png";

export type Hero = {
	position: Vector;
	velocity: Vector;
	body: Circle;
	animation: SpriteAnimation;
};

const speed = 0.05;
const idleSheet = await useSpriteSheetSrc(charIdle, 2, 4);

const state: Hero = {
	position: createVector(),
	velocity: createVector(),
	body: createCircle(createVector(), 4),
	animation: createSpriteAnimation(idleSheet, 500, 2),
};

const process = defineEntity("hero", state);

process((entity, delta) => {
	if (pointer.isDown) {
		entity.position.x = pointer.position.x;
		entity.position.y = pointer.position.y;
	}

	entity.velocity.x -= keyboardInput.arrowLeft ? speed : 0;
	entity.velocity.x += keyboardInput.arrowRight ? speed : 0;
	entity.velocity.y -= keyboardInput.arrowUp ? speed : 0;
	entity.velocity.y += keyboardInput.arrowDown ? speed : 0;

	entity.position.x = Math.round(entity.velocity.x * delta + entity.position.x);
	entity.position.y = Math.round(entity.velocity.y * delta + entity.position.y);

	entity.velocity.x = 0;
	entity.velocity.y = 0;

	moveAndCollide(entity.body, entity.velocity);

	// entity.body.position.x = entity.body.offset.x + entity.position.x;
	// entity.body.position.y = entity.body.offset.y + entity.position.y;
});
