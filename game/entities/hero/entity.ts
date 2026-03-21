import { createCircle } from "#/engine/Circle.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import $ from "#/engine/Scene.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import {
	createCollider,
	moveAndCollide,
	Shape,
} from "#/engine/system/physics.ts";
import {
	createVector,
	normalize,
	scale,
	type Vector,
} from "#/engine/Vector.ts";
import charIdle from "#/game/assets/char-idle.png";

const speed = 0.05;
const idleSrc = await defineSpriteSheet(charIdle, 2, 4);

const process = defineEntity("hero", {
	position: createVector(),
	sprite: createSprite(idleSrc),
	animation: createSpriteAnimation(500, 2),
	velocity: createVector(),
	collider: createCollider(Shape.Cirle, createCircle(createVector(), 8)),
});

process((id, delta) => {
	const position = $<Vector>("position").get(id)!.value;
	const velocity = $<Vector>("velocity").get(id)!.value;

	if (pointer.isDown) {
		position.x = pointer.position.x;
		position.y = pointer.position.y;
	}

	velocity.x -= keyboardInput.arrowLeft ? 1 : 0;
	velocity.x += keyboardInput.arrowRight ? 1 : 0;
	velocity.y -= keyboardInput.arrowUp ? 1 : 0;
	velocity.y += keyboardInput.arrowDown ? 1 : 0;
	normalize(velocity);
	scale(velocity, speed);

	position.x = Math.round(velocity.x * delta + position.x);
	position.y = Math.round(velocity.y * delta + position.y);

	velocity.x = 0;
	velocity.y = 0;

	const collisions = moveAndCollide(id, velocity, delta);
	// console.log(collisions);
});
