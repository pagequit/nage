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
	id: string;
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

export type SceneChangeCallback = (from: Scene, to: Scene) => void;

const sceneDataMap = new Map<string, SceneData>();
const sceneProcessMap = new Map<string, Process>();
const sceneEntiyMap = new Map<string, EntityInstanceMap>();
const sceneGraph: Graph<string> = new Map();

export const currentScene: Scene = {
	data: {
		id: "",
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
		ids: T,
	) => (id: T[number]) => Promise<void>;
	process: (fn: Process) => void;
} {
	sceneDataMap.set(data.id, data);
	sceneEntiyMap.set(data.id, new Map());

	return {
		linkScenes(ids) {
			for (const id of ids) {
				linkScenes(data.id, id);
			}

			return async (id) => {
				return changeScene(id);
			};
		},
		process(fn) {
			sceneProcessMap.set(data.id, (ctx, delta) => {
				animateEntities(ctx, delta);
				processEntities(delta);
				fn(ctx, delta);
			});
		},
	};
}

export function changeScene(id: string): Promise<void> {
	const data = sceneDataMap.get(id)!;
	const process = sceneProcessMap.get(id)!;
	const entityInstanceMap = sceneEntiyMap.get(id)!;
	for (const neighbour of getNeighbours(sceneGraph, id)) {
		if (!sceneCache.has(neighbour)) {
			sceneCache.set(neighbour, loadScene(neighbour));
		}
	}
	currentScene.data = data;
	currentScene.process = process;
	currentScene.entityInstanceMap = entityInstanceMap;
}

export async function loadScene(id: string): Promise<void> {
	await import(`#/scenes/${id}/index.ts`);

	const data = sceneDataMap.get(id)!;
	const process = sceneProcessMap.get(id)!;
	const entityInstanceMap = sceneEntiyMap.get(id)!;
	entityInstanceMap.clear();

	Promise.all(
		data.entities.map(async (entity: Entity<unknown>) => {
			await import(`#/entities/${entity.id}/index.ts`);

			if (!entityInstanceMap.has(entity.id)) {
				entityInstanceMap.set(entity.id, {
					animate: entityAnimateMap.get(entity.id) ?? (() => {}),
					process: entityProcessMap.get(entity.id) ?? (() => {}),
					instances: [],
				});
			}

			const instance: Entity<unknown> = {
				...structuredClone(entityMap.get(entity.id)!),
				...structuredClone(entity),
			};

			entityInstanceMap.get(entity.id)!.instances.push(instance);
		}),
	);

	currentScene.data = data;
	currentScene.process = process;
	currentScene.entityInstanceMap = entityInstanceMap;
}
