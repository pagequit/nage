import type { Vector } from "#/lib/Vector.ts";
import {
	type Animate as AnimateEntity,
	type Entity,
	entityAnimateMap,
	entityMap,
	entityProcessMap,
	type Process as ProcessEntity,
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
	entityMap: Map<
		string,
		{
			animate: AnimateEntity<never>;
			process: ProcessEntity<never>;
			entities: Array<Entity<unknown>>;
		}
	>;
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
	entityMap: new Map(),
};

function animateEntities(ctx: CanvasRenderingContext2D, delta: number): void {
	for (const entry of currentScene.entityMap.values()) {
		for (const entity of entry.entities) {
			entry.animate(entity as Entity<never>, ctx, delta);
		}
	}
}

function processEntities(delta: number): void {
	for (const entry of currentScene.entityMap.values()) {
		for (const entity of entry.entities) {
			entry.process(entity as Entity<never>, delta);
		}
	}
}

export function useScene(data: SceneData): {
	process: (fn: Process) => void;
} {
	sceneDataMap.set(data.id, data);

	return {
		process(fn: Process): void {
			sceneProcessMap.set(data.id, (ctx, delta): void => {
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

	for (const entityData of data.entities) {
		await import(`#/entities/${entityData.id}/index.ts`);

		const entity = entityMap.get(entityData.id) as Entity<unknown>;
		const instance: Entity<unknown> = {
			...structuredClone(entity),
			position: entityData.position,
		};

		if (currentScene.entityMap.has(entity.id)) {
			const entry = currentScene.entityMap.get(entity.id);
			entry!.entities.push(instance);
		} else {
			currentScene.entityMap.set(entity.id, {
				animate: entityAnimateMap.get(entityData.id) ?? (() => {}),
				process: entityProcessMap.get(entityData.id) ?? (() => {}),
				entities: [instance],
			});
		}
	}

	const process = sceneProcessMap.get(name)!;
	currentScene.process = process;
}
