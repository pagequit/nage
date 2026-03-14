import $ from "#/engine/Scene.ts";
import {
	animateSprite,
	type Sprite,
	type SpritePlayback,
} from "#/engine/Sprite.ts";

export function animateSprites(delta: number): void {
	for (const [id, playback] of $<SpritePlayback>("playback").entries()) {
		const sprite = $<Sprite>("sprite").get(id)!;
		animateSprite(sprite.value, playback.value, delta);
	}
}
