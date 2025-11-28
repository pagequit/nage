import { type Entity, useEntity } from "#/engine/Entity.ts";
import { viewport } from "#/engine/Viewport.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createSprite, drawSprite, type Sprite } from "#/lib/Sprite.ts";

const spriteIdle = createSprite(await loadImage("/assets/char-idle.png"), 2, 4);
const spriteWalk = createSprite(await loadImage("/assets/char-walk.png"), 4, 4);
spriteWalk.yIndex = 2;

function animateSprite(
	ctx: CanvasRenderingContext2D,
	sprite: Sprite,
	entity: Entity<any>,
	delta: number,
): void {
	entity.state.animations.walk.frameDelta += delta;
	if (
		entity.state.animations.walk.frameDelta >
		entity.state.animations.walk.frameTime
	) {
		entity.state.animations.walk.frameDelta =
			entity.state.animations.walk.frameDelta %
			entity.state.animations.walk.frameTime;

		spriteWalk.xIndex += 1;
		if (spriteWalk.xIndex >= spriteWalk.xFrames) {
			spriteWalk.xIndex = 0;
		}
	}
	drawSprite(ctx, spriteWalk, entity.position.x, entity.position.y);
}

const { animate, process } = useEntity("testEntity", {
	animations: {
		walk: {
			frameTime: 222,
			frameDelta: 0,
		},
	},
	stuff: 1,
});

animate((entity, ctx, delta) => {
	animateSprite(ctx, spriteIdle, entity, delta);
});

process((entity, delta) => {
	entity.position.x += entity.state.stuff * 0.05 * delta;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.state.stuff = -1;
	} else if (entity.position.x < 0) {
		entity.state.stuff = 1;
	}
});
