import charIdle from "#/assets/char-idle.png";
import charWalk from "#/assets/char-walk.png";
import { useEntity } from "#/engine/Entity.ts";
import { viewport } from "#/engine/Viewport.ts";
import {
	type Animation,
	animateSprite,
	createAnimation,
} from "#/lib/Animation.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createSprite } from "#/lib/Sprite.ts";

const sprites = {
	idle: createSprite(await loadImage(charIdle), 2, 4),
	walk: createSprite(await loadImage(charWalk), 4, 4),
};

const { animate, process } = useEntity<{
	animations: {
		idle: Animation;
		walk: Animation;
	};
	currentAnimation: "idle" | "walk";
	stuff: number;
}>(import.meta, {
	animations: {
		idle: createAnimation(2, 500),
		walk: createAnimation(2, 250),
	},
	currentAnimation: "idle",
	stuff: 1,
});

animate((entity, ctx, delta) => {
	animateSprite(
		ctx,
		sprites[entity.currentAnimation],
		entity.animations[entity.currentAnimation],
		entity.position.x,
		entity.position.y,
		delta,
	);
});

process((entity, delta) => {
	entity.position.x += entity.stuff * 0.5;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.stuff = -1;
		entity.currentAnimation = "walk";
	} else if (entity.position.x < 0) {
		entity.stuff = 1;
		entity.currentAnimation = "idle";
	}
});
