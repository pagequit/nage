import type { Box } from "#/engine/Box.ts";
import { listenKeyboard } from "#/engine/Keyboard.ts";
import { listenPointer } from "#/engine/Pointer.ts";
import $, {
	currentScene,
	sceneChangeSet,
	sceneComponentsMap,
	setScene,
} from "#/engine/Scene.ts";
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

function animateSpriteSystem() {
	for (const [id, playback] of $<SpritePlayback>("playback").entries()) {
		const sprite = $<Sprite>("sprite").get(id)!;
		animateSprite(sprite.value, playback.value, delta);
	}
}

const drawables: Array<{ position: Box<Vector>; sprite: Box<Sprite> }> = [];
sceneChangeSet.add((sceneData) => {
	drawables.length = 0;

	const sprites = [
		...sceneComponentsMap.get(sceneData.name)!.get("sprite")!.values(),
	] as Array<Box<Sprite>>;

	sceneComponentsMap
		.get(sceneData.name)!
		.get("position")!
		.values()
		.forEach((box, index) => {
			drawables.push({
				position: box as Box<Vector>,
				sprite: sprites[index],
			});
		});
});

function drawSpriteSystem() {
	for (const drawable of drawables.sort(
		(a, b) => a.position.value.y - b.position.value.y,
	)) {
		drawSprite(
			viewport.ctx,
			spriteSheetMap.get(drawable.sprite.value.src)!,
			drawable.sprite.value.xStart,
			drawable.sprite.value.yStart,
			drawable.position.value.x,
			drawable.position.value.y,
		);
	}
}

let then = self.performance.now();
let delta = 0;
function animate(timestamp: number): void {
	delta = timestamp - then;
	then = timestamp;

	resetCtx();
	currentScene.process(viewport.ctx, delta);

	animateSpriteSystem();
	drawSpriteSystem();

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
