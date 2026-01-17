import charIdle from "#/assets/char-idle.png";
import charWalk from "#/assets/char-walk.png";
import {
	type Animation,
	createAnimation,
	playAnimation,
} from "#/engine/Animation.ts";
import { useEntity } from "#/engine/Entity.ts";
import { viewport } from "#/engine/Viewport.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createSprite } from "#/lib/Sprite.ts";

const sprites = {
	idle: createSprite(await loadImage(charIdle), 2, 4),
	walk: createSprite(await loadImage(charWalk), 4, 4),
};
const animations = {
	idle: createAnimation(sprites.idle, 500, 2),
	walk: createAnimation(sprites.walk, 250, 2),
} as const;

const { animate, process } = useEntity<{
	animation: Animation;
	animations: {
		idle: Animation;
		walk: Animation;
	};
	stuff: number;
}>(import.meta, {
	animations,
	animation: animations.idle,
	stuff: 1,
});

animate((entity, ctx, delta) => {
	playAnimation(
		ctx,
		entity.animation,
		entity.position.x,
		entity.position.y,
		delta,
	);
});

process((entity, delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.stuff = -1;
		entity.animation = entity.animations.walk;
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
		entity.animation = entity.animations.idle;
	}
});
