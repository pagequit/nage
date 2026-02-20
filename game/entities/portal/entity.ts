import { defineEntity } from "#/engine/Entity.ts";
import { createSpriteAnimation, useSpriteSheetSrc } from "#/engine/Sprite.ts";
import portal from "#/game/assets/portal.png";

const portalSheet = await useSpriteSheetSrc(portal, 3, 1);

defineEntity("portal", {
	animation: createSpriteAnimation(portalSheet, 400, 0),
});
