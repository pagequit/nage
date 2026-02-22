import { defineEntity } from "#/engine/Entity.ts";
import { createSpriteAnimation, useSpriteSheetSrc } from "#/engine/Sprite.ts";
import { createVector } from "#/engine/Vector";
import portal from "#/game/assets/portal.png";

const portalSheet = await useSpriteSheetSrc(portal, 3, 1);

defineEntity("portal", {
	position: createVector(64, 64),
	animation: createSpriteAnimation(portalSheet, 400, 0),
});
