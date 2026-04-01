import { listenKeyboard } from "#/engine/Keyboard.ts";
import { listenPointer } from "#/engine/Pointer.ts";
import $, { currentScene, setScene } from "#/engine/Scene.ts";
import { animateSprites } from "#/engine/system/animateSprites.ts";
import { drawSprites } from "#/engine/system/drawSprites.ts";
import {
	initViewport,
	resetCtx,
	resizeCanvas,
	viewport,
} from "#/engine/Viewport.ts";
import type { Collider } from "./engine/system/physics";
import type { Vector } from "./engine/Vector";

function updateAABBs() {
	const colliders = $<Collider>("collider");
	const positions = $<Vector>("position");

	for (const [id, collider] of colliders.entries()) {
		const position = positions.get(id)!.value;
		const aabb = collider.value.aabb;
		aabb.position.x = position.x;
		aabb.position.y = position.y;
	}
}

let then = self.performance.now();
let delta = 0;
function animate(timestamp: number): void {
	delta = timestamp - then;
	then = timestamp;

	resetCtx();

	updateAABBs();

	currentScene.process(viewport.ctx, delta);

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
