import { loadImage } from "#/lib/loadImage.ts";
import { createSprite } from "#/lib/Sprite.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";
import {
	type Draw as EntityDraw,
	type EntityInstance,
	type Process as EntityProcess,
	entityDrawMap,
	entityMap,
	entityProcessMap,
} from "./Entity.ts";

export type SceneData = {
	id: string;
	width: number;
	height: number;
	entities: Array<{
		id: string;
		position: Vector;
	}>;
};

export type Scene = {
	data: SceneData;
	entityPool: Array<{
		draw: EntityDraw;
		process: EntityProcess;
		entity: EntityInstance;
	}>;
	process: Process;
};

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;

export type SceneChangeCallback = (from: Scene, to: Scene) => void;

let sceneChangeCallback: SceneChangeCallback = (): void => {};

const sceneDataMap = new Map<string, SceneData>();
const sceneProcessMap = new Map<string, Process>();

export const currentScene: Scene = {
	data: {
		id: "",
		width: 0,
		height: 0,
		entities: [],
	},
	process: () => {},
	entityPool: [],
};

function drawEntities(ctx: CanvasRenderingContext2D): void {
	for (const entry of currentScene.entityPool) {
		entry.draw(entry.entity, ctx);
	}
}

function processEntities(delta: number): void {
	for (const entry of currentScene.entityPool) {
		entry.process(entry.entity, delta);
	}
}

export function useScene(data: SceneData): {
	process: (fn: Process) => void;
} {
	sceneDataMap.set(data.id, data);

	return {
		process(fn: Process): void {
			sceneProcessMap.set(data.id, (ctx, delta) => {
				drawEntities(ctx);
				processEntities(delta);
				fn(ctx, delta);
			});
		},
	};
}

export function setSceneChangeCallback(callback: SceneChangeCallback) {
	sceneChangeCallback = callback;
}

export function changeScene(scene: Scene): void {
	sceneChangeCallback(currentScene, scene);
	currentScene.data = scene.data;
	currentScene.process = scene.process;
}

export async function loadScene(name: string): Promise<void> {
	await import(`#/scenes/${name}/index.ts`);

	const data = sceneDataMap.get(name)!;
	currentScene.data = data;

	for (const entity of data.entities) {
		await import(`#/entities/${entity.id}/index.ts`);

		const e = entityMap.get(entity.id)!;
		const entityInstance: EntityInstance = {
			position: entity.position,
			width: e.width,
			height: e.height,
			sprite: createSprite(await loadImage(e.src), 2, 4), // FIXME
		};

		currentScene.entityPool.push({
			draw: entityDrawMap.get(entity.id)!,
			process: entityProcessMap.get(entity.id)!,
			entity: entityInstance,
		});
	}

	const process = sceneProcessMap.get(name)!;
	currentScene.process = process;
}
