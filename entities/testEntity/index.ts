import { useEntity } from "#/engine/Entity.ts";
import { viewport } from "#/engine/Viewport.ts";
import { loadImage } from "#/lib/loadImage.ts";
import { createSprite, drawSprite } from "#/lib/Sprite.ts";

const sprite = createSprite(await loadImage("/assets/char-idle.png"), 2, 4);

const { animate, process } = useEntity("testEntity", {
	animation: {
		xFrame: 0,
		yFrame: 0,
	},
	stuff: 1,
});

animate((entity, ctx, _delta) => {
	drawSprite(ctx, sprite, entity.position.x, entity.position.y, 16, 16);
});

process((entity, _delta) => {
	entity.position.x += entity.state.stuff;
	if (entity.position.x > viewport.canvas.width - 16) {
		entity.state.stuff = -1;
	} else if (entity.position.x < 0) {
		entity.state.stuff = 1;
	}
});
