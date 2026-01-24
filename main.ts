import { listenPointer } from "#/engine/Pointer.ts";
import { currentScene, setScene } from "#/engine/Scene.ts";
import {
	initViewport,
	resetCtx,
	resizeCanvas,
	viewport,
} from "#/engine/Viewport.ts";
import { listenKeyboard } from "./engine/Keyboard.ts";

let then = self.performance.now();
let delta = 0;
function animate(timestamp: number): void {
	delta = timestamp - then;
	then = timestamp;

	resetCtx();
	currentScene.process(viewport.ctx, delta);
	requestAnimationFrame(animate);
}

(async () => {
	if (import.meta.env.DEV) {
		import("#/dev/main.tsx").then((m) => m.use(viewport.gameContainer));
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
