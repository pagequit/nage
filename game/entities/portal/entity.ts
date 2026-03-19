import { createCircle } from "#/engine/Circle.ts";
import { defineEntity } from "#/engine/Entity.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import { Collider, Shape } from "#/engine/system/physics.ts";
import { createVector } from "#/engine/Vector.ts";
import portal from "#/game/assets/portal.png";

const portalSrc = await defineSpriteSheet(portal, 3, 1);

defineEntity("portal", {
	position: createVector(),
	sprite: createSprite(portalSrc),
	animation: createSpriteAnimation(400, 0),
	collider: new Collider(Shape.Cirle, createCircle(createVector(), 8)),
});
