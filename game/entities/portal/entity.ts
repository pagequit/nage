import { defineEntity } from "#/engine/Entity.ts";
import { loadImage } from "#/engine/lib/loadImage.ts";
import { createSpriteAnimation, createSpritesSheet } from "#/engine/sprites.ts";
import portal from "#/game/assets/portal.png";

const portalSheet = createSpritesSheet(await loadImage(portal), 3, 1);

defineEntity("portal", {
	animation: createSpriteAnimation(portalSheet, 400, 0),
});
