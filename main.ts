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
import type { Sprite } from "./engine/Sprite";
import type { Collider } from "./engine/system/physics";
import type { Vector } from "./engine/Vector";

function debug(ctx: CanvasRenderingContext2D) {
	const positions = $<Vector>("position");
	const colliders = $<Collider>("collider");
	const sprites = $<Sprite>("sprite");

	for (const [id, collider] of colliders.entries()) {
		const sprite = sprites.get(id)!.value;
		const pos = positions.get(id)!.value;
		const col = collider.value;

		ctx.beginPath();
		ctx.fillStyle = "#ee459e";
		ctx.strokeStyle = "#ee459e";
		ctx.strokeRect(
			pos.x + col.offset.x + 0.5,
			pos.y + col.offset.y + 0.5,
			col.width - 1,
			col.height - 1,
		);
		ctx.fillRect(pos.x - 1, pos.y - 1, 2, 2);
		ctx.fillRect(
			pos.x - 1 + sprite.offset.x,
			pos.y - 1 + sprite.offset.y,
			2,
			2,
		);

		if (collider.value.shape === 0) {
			// @ts-ignore
			ctx.arc(pos.x, pos.y, collider.value.body.radius, 0, 2 * Math.PI);
			ctx.strokeStyle = "white";
			ctx.stroke();
		}
	}
}

let then = self.performance.now();
let delta = 0;
function animate(timestamp: number): void {
	delta = timestamp - then;
	then = timestamp;

	resetCtx();

	currentScene.process(viewport.ctx, delta);

	animateSprites(delta);
	drawSprites(viewport.ctx);

	debug(viewport.ctx);

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
