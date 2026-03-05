import { type Box, box } from "#/engine/Box.ts";
import { defineEntity } from "#/engine/Entity.ts";
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

const sheets = {
	idle: await defineSpriteSheet(charIdle, 2, 4),
	walk: await defineSpriteSheet(charWalk, 4, 4),
};

const sprites = {
	idle: {
		src: sheets.idle,
		xStart: 0,
		yStart: 0,
		width: 16,
		height: 16,
	},
	walk: {
		src: sheets.walk,
		xStart: 0,
		yStart: 0,
		width: 16,
		height: 16,
	},
};

const animations = {
	idle: createSpritePlayback(sprites.idle, 500, 2),
	walk: createSpritePlayback(sprites.walk, 250, 2),
};

const process = defineEntity<{
	position: Vector;
	animation: Box<SpritePlayback>;
	animations: {
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
	animation: box(animations.idle),
	animations,
	sprite: sprites.idle,
	sprites,
	stuff: 1,
});

process((entity, _delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.stuff = -1;
		entity.animation.value = entity.animations.walk;
		entity.sprite = entity.sprites.walk;
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
		entity.animation.value = entity.animations.idle;
		entity.sprite = entity.sprites.idle;
	}
});
