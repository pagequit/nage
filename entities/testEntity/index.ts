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
	idle: createSprite(await loadImage("/assets/char-idle.png"), 2, 4),
	walk: createSprite(await loadImage("/assets/char-walk.png"), 4, 4),
};

const { animate, process } = useEntity<{
	animations: {
		idle: Animation;
		walk: Animation;
	};
	currentAnimation: "idle" | "walk";
	stuff: number;
}>("testEntity", {
	animations: {
		idle: createAnimation(2, 250),
		walk: createAnimation(2, 250),
	},
	currentAnimation: "idle",
	stuff: 1,
});

animate((entity, ctx, delta) => {
	animateSprite(
		ctx,
		sprites[entity.state.currentAnimation],
		entity.state.animations[entity.state.currentAnimation],
		entity.position.x,
		entity.position.y,
		delta,
	);
});

process((entity, delta) => {
	entity.position.x += entity.state.stuff * 0.05 * delta;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.state.stuff = -1;
		entity.state.currentAnimation = "walk";
	} else if (entity.position.x < 0) {
		entity.state.stuff = 1;
		entity.state.currentAnimation = "idle";
	}
});
