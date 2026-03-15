import $ from "#/engine/Scene.ts";
import {
	animateSprite,
	type Sprite,
	type SpriteAnimation,
} from "#/engine/Sprite.ts";

export function animateSprites(delta: number): void {
	for (const [id, animation] of $<SpriteAnimation>("animation").entries()) {
		const sprite = $<Sprite>("sprite").get(id)!;
		animateSprite(sprite.value, animation.value, delta);
	}
}
