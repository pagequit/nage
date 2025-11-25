export type SceneData = {
	id: string;
	width: number;
	height: number;
	entities: string[];
};

export type Scene = {
	data: SceneData;
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
};

export function useScene(data: SceneData): {
	process: (fn: Process) => void;
} {
	sceneDataMap.set(data.id, data);

	return {
		process(fn: Process): void {
			sceneProcessMap.set(data.id, fn);
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

	const process = sceneProcessMap.get(name)!;
	currentScene.process = process;
}
