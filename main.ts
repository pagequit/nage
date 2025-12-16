import { currentScene, loadScene } from "#/engine/Scene.ts";
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
	requestAnimationFrame(animate);
}

(async () => {
	if (import.meta.env.DEV) {
		import("#/dev/main.tsx").then((m) => m.use(viewport.gameContainer));
	}

	initViewport();
	await loadScene("testScene");

	resizeCanvas(currentScene.data.width, currentScene.data.height);
	self.addEventListener("resize", () => {
		resizeCanvas(currentScene.data.width, currentScene.data.height);
	});

	animate(delta);
})();
