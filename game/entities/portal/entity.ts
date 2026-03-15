import { defineEntity } from "#/engine/Entity.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import { createVector } from "#/engine/Vector.ts";
import portal from "#/game/assets/portal.png";

const portalSrc = await defineSpriteSheet(portal, 3, 1);

defineEntity("portal", {
	position: createVector(),
	sprite: createSprite(portalSrc),
	animation: createSpriteAnimation(400, 0),
});
