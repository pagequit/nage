import { defineEntity } from "#/engine/Entity.ts";
import {
	createSpriteAnimation,
	type SpriteAnimation,
	useSpriteSheetSrc,
} from "#/engine/Sprite.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import { viewport } from "#/engine/Viewport.ts";
import charIdle from "#/game/assets/char-idle.png";
import charWalk from "#/game/assets/char-walk.png";

const sprites = {
	idle: await useSpriteSheetSrc(charIdle, 2, 4),
	walk: await useSpriteSheetSrc(charWalk, 4, 4),
};

const animations = {
	idle: createSpriteAnimation(sprites.idle, 500, 2),
	walk: createSpriteAnimation(sprites.walk, 250, 2),
};

const process = defineEntity<{
	position: Vector;
	animation: SpriteAnimation;
	animations: {
		idle: SpriteAnimation;
		walk: SpriteAnimation;
	};
	stuff: number;
}>("testEntity", {
	position: createVector(),
	animations,
	animation: animations.idle,
	stuff: 1,
});

process((entity, _delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.stuff = -1;
		entity.animation = entity.animations.walk;
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
		entity.animation = entity.animations.idle;
	}
});
