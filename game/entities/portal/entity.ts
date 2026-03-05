import { box } from "#/engine/Box.ts";
import { defineEntity } from "#/engine/Entity.ts";
import { createSpritePlayback, defineSpriteSheet } from "#/engine/Sprite.ts";
import { createVector } from "#/engine/Vector.ts";
import portal from "#/game/assets/portal.png";

const portalSheet = await defineSpriteSheet(portal, 3, 1);
const sprite = {
	src: portalSheet,
	xStart: 0,
	yStart: 0,
	width: 16,
	height: 16,
};

defineEntity("portal", {
	position: createVector(64, 64),
	sprite,
	animation: box(createSpritePlayback(sprite, 400, 0)),
});
