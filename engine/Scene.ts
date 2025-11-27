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
	entityPool: Map<
		string,
		{
			hooks: {
				animate: AnimateEntity<never>;
				process: ProcessEntity<never>;
			};
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
	entityPool: new Map(),
};

function animateEntities(ctx: CanvasRenderingContext2D, delta: number): void {
	for (const entry of currentScene.entityPool.values()) {
		for (const entity of entry.entities) {
			entry.hooks.animate(entity as Entity<never>, ctx, delta);
		}
	}
}

function processEntities(delta: number): void {
	for (const entry of currentScene.entityPool.values()) {
		for (const entity of entry.entities) {
			entry.hooks.process(entity as Entity<never>, delta);
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

	for (const entry of data.entities) {
		await import(`#/entities/${entry.id}/index.ts`);

		const e = entityMap.get(entry.id) as Entity<unknown>;
		const entity: Entity<unknown> = {
			id: e.id,
			position: entry.position,
			state: structuredClone(e.state),
		};

		if (currentScene.entityPool.has(e.id)) {
			const pool = currentScene.entityPool.get(e.id);
			pool!.entities.push(entity);
		} else {
			currentScene.entityPool.set(e.id, {
				hooks: {
					animate: entityAnimateMap.get(entry.id)!,
					process: entityProcessMap.get(entry.id)!,
				},
				entities: [entity],
			});
		}
	}

	const process = sceneProcessMap.get(name)!;
	currentScene.process = process;
}
