import { defineEntity } from "#/engine/Entity.ts";
import $ from "#/engine/Scene.ts";
import {
	createSpriteAnimation,
	defineSpriteSheet,
	type Sprite,
	type SpriteAnimation,
} from "#/engine/Sprite.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import { viewport } from "#/engine/Viewport.ts";
import charIdle from "#/game/assets/char-idle.png";
import charWalk from "#/game/assets/char-walk.png";

const srcs = {
	idle: await defineSpriteSheet(charIdle, 2, 4),
	walk: await defineSpriteSheet(charWalk, 4, 4),
};

const sprites = {
	idle: {
		src: srcs.idle,
		xStart: 0,
		yStart: 0,
		width: 16,
		height: 16,
	},
	walk: {
		src: srcs.walk,
		xStart: 0,
		yStart: 0,
		width: 16,
		height: 16,
	},
};

const animations = {
	idle: createSpriteAnimation(500, 2),
	walk: createSpriteAnimation(250, 2),
};

const process = defineEntity<{
	position: Vector;
	animation: SpriteAnimation;
	animations: {
		idle: SpriteAnimation;
		walk: SpriteAnimation;
	};
	sprite: Sprite;
	sprites: {
		idle: Sprite;
		walk: Sprite;
	};
	stuff: number;
}>("testEntity", {
	position: createVector(),
	animation: animations.idle,
	animations: animations,
	sprite: sprites.idle,
	sprites,
	stuff: 1,
});

process((id, _delta) => {
	const position = $<Vector>("position").get(id)!;
	const stuff = $<number>("stuff").get(id)!;
	const sprite = $<Sprite>("sprite").get(id)!;
	const animation = $<SpriteAnimation>("animation").get(id)!;

	position.value.x += stuff.value * 0.5;
	if (position.value.x > viewport.canvas.width - 16) {
		stuff.value = -1;
		animation.value = animations.walk;
		sprite.value = sprites.walk;
	} else if (position.value.x < 0) {
		stuff.value = 1;
		animation.value = animations.idle;
		sprite.value = sprites.idle;
	}
});
