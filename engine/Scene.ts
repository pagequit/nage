import { type Box, box } from "#/engine/Box.ts";
import {
	type Process as EntityProcess,
	entityBlueprintMap,
	entityProcessMap,
} from "#/engine/Entity.ts";
import { type Graph, getNeighbours } from "#/engine/Graph.ts";
import { useWithAsyncCache } from "#/engine/lib/cache.ts";
import MapProxy from "#/engine/lib/MapProxy.ts";

export type Process = (ctx: CanvasRenderingContext2D, delta: number) => void;
export type PreProcess = () => void;
export type PostProcess = () => void;

export type EntityData<T> = {
	name: string;
	init: T;
};

export type SceneData = {
	name: string;
	width: number;
	height: number;
	entities: Array<EntityData<unknown>>;
};

export type ComponentsMap = Map<string, MapProxy<string, unknown>>;

export type Scene = {
	data: SceneData;
	components: ComponentsMap;
	process: Process;
};

export type SceneChange = (to: SceneData, from: SceneData) => void;

export const sceneDataMap = new Map<string, SceneData>();
export const sceneProcessMap = new Map<string, Process>();
export const sceneComponentsMap = new Map<string, ComponentsMap>();

export const scenePreProcessMap = new Map<string, PreProcess>();
export const scenePostProcessMap = new Map<string, PostProcess>();

export const sceneChangeSet = new Set<SceneChange>();
export const sceneGraph: Graph<string> = new Map();

export const currentScene: Scene = {
	data: {
		name: "",
		width: 0,
		height: 0,
		entities: [],
	},
	components: new Map(),
	process: () => {},
};

function processEntities(delta: number): void {
	for (const [id, processBox] of sceneComponentsMap
		.get(currentScene.data.name)!
		.get("process")!.map) {
		(processBox as Box<EntityProcess>).value(id, delta);
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
	process: (fn: Process) => void;
	preProcess: (fn: PreProcess) => void;
	postProcess: (fn: PostProcess) => void;
	linkScenes: <T extends readonly string[]>(
		names: T,
	) => (name: T[number]) => Promise<void>;
} {
	sceneDataMap.set(data.name, data);

	return {
		process(fn) {
			sceneProcessMap.set(data.name, (ctx, delta) => {
				fn(ctx, delta);
				processEntities(delta);
			});
		},
		preProcess(fn) {
			scenePreProcessMap.set(data.name, fn);
		},
		postProcess(fn) {
			scenePostProcessMap.set(data.name, fn);
		},
		linkScenes(ids) {
			for (const id of ids) {
				linkScenes(data.name, id);
			}

			return async (id) => {
				return setScene(id);
			};
		},
	};
}

const [loadScene, sceneCache] = useWithAsyncCache(async (name: string) => {
	await import(`#/game/scenes/${name}/scene.ts`);
	const data = sceneDataMap.get(name)!;

	const componentsMap = new Map<string, MapProxy<string, unknown>>();
	sceneComponentsMap.set(name, componentsMap);

	const entityProcessMapProxy = new MapProxy<string, EntityProcess>();
	componentsMap.set("process", entityProcessMapProxy);

	await Promise.all(
		data.entities.map(
			async (entityData: EntityData<unknown>, index: number) => {
				await import(`#/game/entities/${entityData.name}/entity.ts`);
				const id = `${index}_${entityData.name}`;

				const entityProcess = entityProcessMap.get(entityData.name);
				if (entityProcess !== undefined) {
					entityProcessMapProxy.map.set(id, box(entityProcess));
				}

				for (const [key, value] of entityBlueprintMap
					.get(entityData.name)!
					.entries()) {
					if (componentsMap.has(key)) {
						componentsMap.get(key)?.map.set(id, box(structuredClone(value)));
					} else {
						componentsMap.set(
							key,
							new MapProxy([[id, box(structuredClone(value))]]),
						);
					}
				}
			},
		),
	);
});

export async function setScene(name: string): Promise<void> {
	await loadScene(name);
	for (const neighbour of getNeighbours(sceneGraph, name)) {
		if (!sceneCache.has(neighbour)) {
			sceneCache.set(neighbour, loadScene(neighbour));
		}
	}

	const data = sceneDataMap.get(name)!;
	const components = sceneComponentsMap.get(name)!;
	const process = sceneProcessMap.get(name)!;

	const preProcess = scenePreProcessMap.get(name);
	if (preProcess) {
		preProcess();
	}

	const postProcess = scenePostProcessMap.get(currentScene.data.name);
	if (postProcess) {
		postProcess();
	}

	currentScene.data = data;
	self.dispatchEvent(new Event("resize"));

	currentScene.components = components;
	currentScene.process = process;

	for (const callback of sceneChangeSet.values()) {
		callback(data, currentScene.data);
	}
}

export default function <T>(name: string): MapProxy<string, T> {
	return currentScene.components.get(name) as MapProxy<string, T>;
}
