import { defineEntity } from "#/engine/Entity.ts";
import $ from "#/engine/Scene.ts";
import {
	createSpritePlayback,
	defineSpriteSheet,
	type Sprite,
	type SpritePlayback,
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

const playbacks = {
	idle: createSpritePlayback(500, 2),
	walk: createSpritePlayback(250, 2),
};

const process = defineEntity<{
	position: Vector;
	playback: SpritePlayback;
	playbacks: {
		idle: SpritePlayback;
		walk: SpritePlayback;
	};
	sprite: Sprite;
	sprites: {
		idle: Sprite;
		walk: Sprite;
	};
	stuff: number;
}>("testEntity", {
	position: createVector(),
	playback: playbacks.idle,
	playbacks: playbacks,
	sprite: sprites.idle,
	sprites,
	stuff: 1,
});

process((id, _delta) => {
	const position = $<Vector>("position").get(id)!;
	const stuff = $<number>("stuff").get(id)!;
	const sprite = $<Sprite>("sprite").get(id)!;
	const playback = $<SpritePlayback>("playback").get(id)!;

	position.value.x += stuff.value * 0.5;
	if (position.value.x > viewport.canvas.width - 16) {
		stuff.value = -1;
		playback.value = playbacks.walk;
		sprite.value = sprites.walk;
	} else if (position.value.x < 0) {
		stuff.value = 1;
		playback.value = playbacks.idle;
		sprite.value = sprites.idle;
	}
});
