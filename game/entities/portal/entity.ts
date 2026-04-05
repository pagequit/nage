import { defineEntity } from "#/engine/Entity.ts";
import { createRect } from "#/engine/Rect.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import { createCollider, Shape } from "#/engine/system/physics.ts";
import { createVector } from "#/engine/Vector.ts";
import portal from "#/game/assets/portal.png";

const portalSrc = await defineSpriteSheet(portal, 3, 1);
const position = createVector();

defineEntity("portal", {
	position,
	sprite: createSprite(portalSrc, createVector(-8, -8)),
	animation: createSpriteAnimation(400, 0),
	collider: createCollider(Shape.Rect, createRect(16, 16)),
});
