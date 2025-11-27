import { useEntity } from "#/engine/Entity.ts";
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
	if (entity.state.stuff === 1) {
		entity.position.x += 1;
		if (entity.position.x > 164) {
			entity.state.stuff = 0;
		}
	}
});
