import { listenKeyboard } from "#/engine/Keyboard.ts";
import { listenPointer } from "#/engine/Pointer.ts";
import { currentScene, setScene } from "#/engine/Scene.ts";
import { animateSprites } from "#/engine/system/animateSprites.ts";
import { drawSprites } from "#/engine/system/drawSprites.ts";
import { processPhysics } from "#/engine/system/processPhysics.ts";
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

	processPhysics(viewport.ctx, delta);

	animateSprites(delta);
	drawSprites(viewport.ctx);

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
