import { createVector, type Vector } from "#/lib/Vector.ts";

export type Viewport = {
	initialScale: number;
	imageSmoothing: CanvasImageSmoothing;
	translation: Vector;
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	gameContainer: HTMLElement;
	canvasContainer: HTMLElement;
};

export const viewport: Viewport = {
	initialScale: 4,
	imageSmoothing: {
		imageSmoothingEnabled: false,
		imageSmoothingQuality: "low",
	},
	translation: createVector(),
	ctx: null as unknown as CanvasRenderingContext2D,
	canvas: null as unknown as HTMLCanvasElement,
	gameContainer: null as unknown as HTMLElement,
	canvasContainer: null as unknown as HTMLElement,
};

export function initViewport(): void {
	const gameContainer = document.createElement("div");
	gameContainer.id = "gameContainer";

	const canvasContainer = document.createElement("div");
	canvasContainer.id = "canvasContainer";

	const canvas = document.createElement("canvas");
	viewport.ctx = canvas.getContext("2d", {
		alpha: false,
	}) as CanvasRenderingContext2D;

	viewport.canvas = canvas;
	viewport.canvasContainer = canvasContainer;
	viewport.gameContainer = gameContainer;

	canvasContainer.appendChild(canvas);
	gameContainer.appendChild(canvasContainer);
	document.body.appendChild(gameContainer);
}

export function setScale(scale: number): void {
	viewport.initialScale = scale;
	self.dispatchEvent(new Event("resize"));
}

export function resizeCanvas(width: number, height: number): void {
	const {
		initialScale,
		imageSmoothing,
		ctx,
		canvas,
		canvasContainer,
		gameContainer,
	} = viewport;

	const containerWidth = (gameContainer.offsetWidth / initialScale) | 0;
	const containerHeight = (gameContainer.offsetHeight / initialScale) | 0;

	canvas.width = Math.min(width, containerWidth);
	canvas.height = Math.min(height, containerHeight);

	ctx.imageSmoothingEnabled = imageSmoothing.imageSmoothingEnabled;
	ctx.imageSmoothingQuality = imageSmoothing.imageSmoothingQuality;

	const canvasWidth =
		canvas.width * initialScale - (containerWidth % initialScale);
	const canvasHeight =
		canvas.height * initialScale - (containerHeight % initialScale);

	canvasContainer.style = `width: ${canvasWidth}px; height: ${canvasHeight}px;`;
}

export function resetCtx() {
	const { ctx, canvas, translation } = viewport;

	ctx.restore();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(-(translation.x | 0), -(translation.y | 0));
}
