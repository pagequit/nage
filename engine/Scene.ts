import type { Vector } from "#/lib/Vector.ts";
import {
	type Entity,
	type Animate as EntityDraw,
	type Process as EntityProcess,
	entityAnimateMap,
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
		draw: EntityDraw<never>;
		process: EntityProcess<never>;
		entity: Entity<never>;
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

function animateEntities(ctx: CanvasRenderingContext2D, delta: number): void {
	for (const entry of currentScene.entityPool) {
		entry.draw(entry.entity, ctx, delta);
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
				animateEntities(ctx, delta);
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

	for (const entry of data.entities) {
		await import(`#/entities/${entry.id}/index.ts`);

		const e = entityMap.get(entry.id) as Entity<never>;
		const entity: Entity<never> = {
			id: e.id,
			position: entry.position,
			state: structuredClone(e.state),
		};

		currentScene.entityPool.push({
			draw: entityAnimateMap.get(entry.id)!,
			process: entityProcessMap.get(entry.id)!,
			entity: entity,
		});
	}

	const process = sceneProcessMap.get(name)!;
	currentScene.process = process;
}
