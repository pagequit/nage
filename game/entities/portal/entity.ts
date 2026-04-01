import { defineEntity } from "#/engine/Entity.ts";
import { createRect, fillRect, strokeRect } from "#/engine/Rect.ts";
import $ from "#/engine/Scene.ts";
import {
	createSprite,
	createSpriteAnimation,
	defineSpriteSheet,
} from "#/engine/Sprite.ts";
import {
	type Collider,
	createCollider,
	Shape,
} from "#/engine/system/physics.ts";
import { createVector, type Vector } from "#/engine/Vector.ts";
import { viewport } from "#/engine/Viewport";
import portal from "#/game/assets/portal.png";

const portalSrc = await defineSpriteSheet(portal, 3, 1);

const process = defineEntity("portal", {
	position: createVector(),
	sprite: createSprite(portalSrc),
	animation: createSpriteAnimation(400, 0),
	collider: createCollider(Shape.Rect, createRect(createVector(), 16, 16)),
});

process((id, delta) => {
	const collider = $<Collider>("collider").get(id)!.value;

	fillRect(viewport.ctx, collider.aabb, "orange");
	strokeRect(viewport.ctx, collider.aabb, "red");
});
