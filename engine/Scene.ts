import {
	entityMap,
	entityProcessMap,
	type Process as ProcessEntity,
} from "#/engine/Entity.ts";
import { type Graph, getNeighbours } from "#/engine/Graph.ts";
import { useWithAsyncCache } from "#/engine/lib/cache.ts";

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

export type EntityInstanceMap = Map<
	string,
	{
		process: ProcessEntity<object>;
		instances: Array<object>;
	}
>;

export type Scene = {
	data: SceneData;
	entityInstanceMap: EntityInstanceMap;
	process: Process;
};

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;
export type PreProcess = (entityInstanceMap: EntityInstanceMap) => void;
export type PostProcess = (entityInstanceMap: EntityInstanceMap) => void;

export type SceneChangeHandler = (to: SceneData, from: SceneData) => void;

export const sceneProcessMap = new Map<string, Process>();
export const scenePreProcessMap = new Map<string, PreProcess>();
export const scenePostProcessMap = new Map<string, PostProcess>();

export const sceneChangedHandlers = new Set<SceneChangeHandler>();

export const sceneDataMap = new Map<string, SceneData>();
export const sceneEntiyInstanceMap = new Map<string, EntityInstanceMap>();
export const sceneGraph: Graph<string> = new Map();

const sceneInstancesMap = new Map<string, Array<object>>();

export const [loadScene, sceneCache] = useWithAsyncCache(
	async (name: string) => {
		await import(`#/game/scenes/${name}/scene.ts`);

		const data = sceneDataMap.get(name)!;
		const entityInstanceMap = sceneEntiyInstanceMap.get(name)!;
		entityInstanceMap.clear();

		await Promise.all(
			data.entities.map(async (entityData: EntityData) => {
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
	entityInstanceMap: new Map(),
};

// function animateEntities(ctx: CanvasRenderingContext2D, delta: number): void {
// 	const instances = sceneInstancesMap.get(currentScene.data.name)!;
// 	instances.sort((a, b) => a.position.y - b.position.y);

// 	for (const instance of instances) {
// 		currentScene.entityInstanceMap
// 			.get(instance.name)!
// 			.animate(instance as Entity<Indirect>, ctx, delta);
// 	}
// }

function processEntities(delta: number): void {
	for (const entity of currentScene.entityInstanceMap.values()) {
		for (const instance of entity.instances) {
			entity.process(instance, delta);
		}
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
	sceneEntiyInstanceMap.set(data.name, new Map());

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
				processEntities(delta);
				fn(ctx, delta);
				// animateEntities(ctx, delta);
			});
		},
		preProcess(fn): void {
			scenePreProcessMap.set(data.name, fn);
		},
		postProcess(fn): void {
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
	const entityInstanceMap = sceneEntiyInstanceMap.get(name)!;
	sceneInstancesMap.set(
		data.name,
		entityInstanceMap.values().reduce(
			(acc, cur) => {
				for (const instance of cur.instances) {
					acc.push(instance);
				}
				return acc;
			},
			[] as Array<object>,
		),
	);

	const preProcess = scenePreProcessMap.get(name);
	if (preProcess) {
		preProcess(sceneEntiyInstanceMap.get(name)!);
	}

	const postProcess = scenePostProcessMap.get(currentScene.data.name);
	if (postProcess) {
		postProcess(sceneEntiyInstanceMap.get(name)!);
	}

	currentScene.data = data;
	self.dispatchEvent(new Event("resize"));

	currentScene.process = process;

	currentScene.entityInstanceMap = entityInstanceMap;

	for (const handler of sceneChangedHandlers.values()) {
		handler(data, currentScene.data);
	}
}
