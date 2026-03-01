import type { Box } from "#/engine/Box.ts";
import { type Drawable, draw, isDrawable } from "#/engine/Drawable.ts";
import {
	entityMap,
	entityProcessMap,
	type Process as ProcessEntity,
} from "#/engine/Entity.ts";
import { type Graph, getNeighbours } from "#/engine/Graph.ts";
import { useWithAsyncCache } from "#/engine/lib/cache.ts";
import { animateSprite, type SpriteAnimation } from "#/engine/Sprite.ts";

export type EntityData = {
	name: string;
	init: object;
};

export type SceneData = {
	name: string;
	width: number;
	height: number;
	entities: Array<EntityData>;
};

export type EntityMap = Map<
	string,
	{
		process: ProcessEntity<{ id: number }>;
		instances: Array<{ id: number }>;
	}
>;

export type AnimationMap = Map<number, Box<SpriteAnimation>>;

export type Scene = {
	data: SceneData;
	entityMap: EntityMap;
	process: Process;
};

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;
export type PreProcess = (entityMap: EntityMap) => void;
export type PostProcess = (entityMap: EntityMap) => void;

export type SceneChangeHandler = (to: SceneData, from: SceneData) => void;

export const sceneProcessMap = new Map<string, Process>();
export const scenePreProcessMap = new Map<string, PreProcess>();
export const scenePostProcessMap = new Map<string, PostProcess>();

export const sceneChangedHandlers = new Set<SceneChangeHandler>();

export const sceneDataMap = new Map<string, SceneData>();
export const sceneEntiyMap = new Map<string, EntityMap>();
export const sceneGraph: Graph<string> = new Map();

const sceneInstancesDrawMap = new Map<
	string,
	Array<Drawable & { id: number }>
>();
const sceneInstancesAnimationMap = new Map<string, AnimationMap>();

export const [loadScene, sceneCache] = useWithAsyncCache(
	async (name: string) => {
		await import(`#/game/scenes/${name}/scene.ts`);

		const data = sceneDataMap.get(name)!;
		const entityInstanceMap = sceneEntiyMap.get(name)!;
		entityInstanceMap.clear();

		await Promise.all(
			data.entities.map(async (entityData: EntityData, index: number) => {
				await import(`#/game/entities/${entityData.name}/entity.ts`);

				if (!entityInstanceMap.has(entityData.name)) {
					entityInstanceMap.set(entityData.name, {
						process: entityProcessMap.get(entityData.name) ?? (() => {}),
						instances: [],
					});
				}

				try {
					entityInstanceMap.get(entityData.name)!.instances.push(
						structuredClone({
							...entityMap.get(entityData.name)!,
							...entityData,
							id: index,
						}),
					);
				} catch (error) {
					console.error(entityData.name, error);
				}
			}),
		);
	},
);

export const currentScene: Scene = {
	data: {
		name: "",
		width: 0,
		height: 0,
		entities: [],
	},
	process: () => {},
	entityMap: new Map(),
};

function processEntities(delta: number): void {
	for (const entry of currentScene.entityMap.values()) {
		for (const instance of entry.instances) {
			entry.process(instance, delta);
		}
	}
}

function processSystems(ctx: CanvasRenderingContext2D, delta: number): void {
	const drawables = sceneInstancesDrawMap.get(currentScene.data.name)!;
	const animationsMap = sceneInstancesAnimationMap.get(currentScene.data.name)!;

	for (const drawable of drawables.sort(
		(a, b) => a.position.y - b.position.y,
	)) {
		// this dosn't belong here
		if (animationsMap.has(drawable.id)) {
			animateSprite(animationsMap.get(drawable.id)!.value, delta);
		}
		draw(ctx, drawable);
	}
}

function linkScenes(a: string, b: string): void {
	if (sceneGraph.has(a)) {
		sceneGraph.get(a)!.push(b);
	} else {
		sceneGraph.set(a, [b]);
	}
}

export function defineScene(data: SceneData): {
	linkScenes: <T extends readonly string[]>(
		names: T,
	) => (name: T[number]) => Promise<void>;
	process: (fn: Process) => void;
	preProcess: (fn: PreProcess) => void;
	postProcess: (fn: PostProcess) => void;
} {
	sceneDataMap.set(data.name, data);
	sceneEntiyMap.set(data.name, new Map());

	return {
		linkScenes(ids) {
			for (const id of ids) {
				linkScenes(data.name, id);
			}

			return async (id) => {
				return setScene(id);
			};
		},
		process(fn) {
			sceneProcessMap.set(data.name, (ctx, delta) => {
				fn(ctx, delta);
				processEntities(delta);
				processSystems(ctx, delta);
			});
		},
		preProcess(fn) {
			scenePreProcessMap.set(data.name, fn);
		},
		postProcess(fn) {
			scenePostProcessMap.set(data.name, fn);
		},
	};
}

export async function setScene(name: string): Promise<void> {
	await loadScene(name);
	for (const neighbour of getNeighbours(sceneGraph, name)) {
		if (!sceneCache.has(neighbour)) {
			sceneCache.set(neighbour, loadScene(neighbour));
		}
	}

	const data = sceneDataMap.get(name)!;
	const process = sceneProcessMap.get(name)!;
	const entityInstanceMap = sceneEntiyMap.get(name)!;

	const drawableInstances: Array<Drawable & { id: number }> = [];
	sceneInstancesDrawMap.set(data.name, drawableInstances);

	const animateInstances: AnimationMap = new Map();
	sceneInstancesAnimationMap.set(data.name, animateInstances);

	for (const entity of entityInstanceMap.values()) {
		for (const instance of entity.instances) {
			if (isDrawable(instance)) {
				drawableInstances.push(instance);
			}
			if (
				(instance as { id: number; animation: object }).animation !== undefined
			) {
				animateInstances.set(
					instance.id,
					(instance as { id: number; animation: Box<SpriteAnimation> })
						.animation, // TODO
				);
			}
		}
	}

	const preProcess = scenePreProcessMap.get(name);
	if (preProcess) {
		preProcess(sceneEntiyMap.get(name)!);
	}

	const postProcess = scenePostProcessMap.get(currentScene.data.name);
	if (postProcess) {
		postProcess(sceneEntiyMap.get(name)!);
	}

	currentScene.data = data;
	self.dispatchEvent(new Event("resize"));

	currentScene.process = process;

	currentScene.entityMap = entityInstanceMap;

	for (const handler of sceneChangedHandlers.values()) {
		handler(data, currentScene.data);
	}
}
