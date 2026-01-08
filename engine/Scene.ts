import { useWithAsyncCache } from "#/lib/cache.ts";
import { type Graph, getNeighbours } from "#/lib/Graph.ts";
import {
	type Animate as AnimateEntity,
	type Entity,
	entityAnimateMap,
	entityMap,
	entityProcessMap,
	type Indirect,
	type Process as ProcessEntity,
} from "./Entity.ts";

export type SceneData = {
	name: string;
	width: number;
	height: number;
	entities: Array<Entity<unknown>>;
};

export type EntityInstanceMap = Map<
	string,
	{
		animate: AnimateEntity<Indirect>;
		process: ProcessEntity<Indirect>;
		instances: Array<Entity<unknown>>;
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

const sceneProcessMap = new Map<string, Process>();
const scenePreProcessMap = new Map<string, PreProcess>();
const scenePostProcessMap = new Map<string, PostProcess>();

const sceneDataMap = new Map<string, SceneData>();
const sceneEntiyMap = new Map<string, EntityInstanceMap>();

export const sceneChangedHandlers = new Set<SceneChangeHandler>();

export const sceneGraph: Graph<string> = new Map();

export const [loadScene, sceneCache] = useWithAsyncCache(
	async (name: string) => {
		await import(`#/scenes/${name}/index.ts`);

		const data = sceneDataMap.get(name)!;
		const entityInstanceMap = sceneEntiyMap.get(name)!;
		entityInstanceMap.clear();

		await Promise.all(
			data.entities.map(async (entity: Entity<unknown>) => {
				await import(`#/entities/${entity.name}/index.ts`);

				if (!entityInstanceMap.has(entity.name)) {
					entityInstanceMap.set(entity.name, {
						animate: entityAnimateMap.get(entity.name) ?? (() => {}),
						process: entityProcessMap.get(entity.name) ?? (() => {}),
						instances: [],
					});
				}

				const instance: Entity<unknown> = structuredClone({
					...entityMap.get(entity.name)!,
					...entity,
				});

				entityInstanceMap.get(entity.name)!.instances.push(instance);
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

function animateEntities(ctx: CanvasRenderingContext2D, delta: number): void {
	for (const entity of currentScene.entityInstanceMap.values()) {
		for (const instance of entity.instances) {
			entity.animate(instance as Entity<Indirect>, ctx, delta);
		}
	}
}

function processEntities(delta: number): void {
	for (const entity of currentScene.entityInstanceMap.values()) {
		for (const instance of entity.instances) {
			entity.process(instance as Entity<Indirect>, delta);
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

export function useScene(data: SceneData): {
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
				processEntities(delta);
				fn(ctx, delta);
				animateEntities(ctx, delta);
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
	const entityInstanceMap = sceneEntiyMap.get(name)!;

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

	currentScene.entityInstanceMap = entityInstanceMap;

	for (const handler of sceneChangedHandlers.values()) {
		handler(data, currentScene.data);
	}
}
