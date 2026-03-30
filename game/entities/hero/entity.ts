import { defineEntity } from "#/engine/Entity.ts";
import { keyboardInput } from "#/engine/Keyboard.ts";
import { pointer } from "#/engine/Pointer.ts";
import { createRect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import {
	createCollider,
	moveAndSlide,
	Shape,
} from "#/engine/system/physics.ts";
import {
	createVector,
	normalize,
	scale,
	type Vector,
} from "#/engine/Vector.ts";
import charIdle from "#/game/assets/char-idle.png";

const speed = 0.1;
const idleSrc = await defineSpriteSheet(charIdle, 2, 4);

const process = defineEntity("hero", {
	position: createVector(),
	sprite: createSprite(idleSrc),
	animation: createSpriteAnimation(500, 2),
	velocity: createVector(),
	collider: createCollider(Shape.Rect, createRect(createVector(), 16, 16)),
});

process((id, delta) => {
	const position = $<Vector>("position").get(id)!.value;
	const velocity = $<Vector>("velocity").get(id)!.value;

	if (pointer.isDown) {
		position.x = pointer.position.x;
		position.y = pointer.position.y;
		return;
	}

	velocity.x -= keyboardInput.arrowLeft ? 1 : 0;
	velocity.x += keyboardInput.arrowRight ? 1 : 0;
	velocity.y -= keyboardInput.arrowUp ? 1 : 0;
	velocity.y += keyboardInput.arrowDown ? 1 : 0;

	normalize(velocity);
	scale(velocity, speed);
	moveAndSlide(id, velocity, delta);

	position.x += velocity.x * delta;
	position.y += velocity.y * delta;

	velocity.x = 0;
	velocity.y = 0;
});
