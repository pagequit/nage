import { listenKeyboard } from "#/engine/Keyboard.ts";
import { listenPointer } from "#/engine/Pointer.ts";
import $, { currentScene, setScene } from "#/engine/Scene.ts";
import {
	animateSprite,
	drawSprite,
	type Sprite,
	type SpritePlayback,
	spriteSheetMap,
} from "#/engine/Sprite.ts";
import type { Vector } from "#/engine/Vector.ts";
import {
	initViewport,
	resetCtx,
	resizeCanvas,
	viewport,
} from "#/engine/Viewport.ts";

let then = self.performance.now();
let delta = 0;
function animate(timestamp: number): void {
	delta = timestamp - then;
	then = timestamp;

	resetCtx();
	currentScene.process(viewport.ctx, delta);

	for (const [id, playback] of $<SpritePlayback>("playback").entries()) {
		const sprite = $<Sprite>("sprite").get(id)!;
		animateSprite(sprite.value, playback.value, delta);
	}

	for (const [id, sprite] of $<Sprite>("sprite").entries()) {
		const position = $<Vector>("position").get(id)!;
		drawSprite(
			viewport.ctx,
			spriteSheetMap.get(sprite.value.src)!,
			sprite.value.xStart,
			sprite.value.yStart,
			position.value.x,
			position.value.y,
		);
	}

	requestAnimationFrame(animate);
}

(async () => {
	if (import.meta.env.DEV) {
		import("#/engine/dev/main").then((m) => m.use(viewport.gameContainer));
	}

	initViewport();
	await setScene("testScene");

	resizeCanvas(currentScene.data.width, currentScene.data.height);
	self.addEventListener("resize", () => {
		resizeCanvas(currentScene.data.width, currentScene.data.height);
	});

	listenPointer();
	listenKeyboard();

	animate(delta);
})();
