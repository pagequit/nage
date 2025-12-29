import "./main.css";
import { type Accessor, type Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { InputField } from "#/dev/controls/InputField.tsx";
import { RangeSlider } from "#/dev/controls/RangeSlider.tsx";
import { type BrowserFolder, FileBrowser } from "#/dev/FileBrowser.tsx";
import type { ListItem } from "#/dev/ItemList.tsx";
import {
	ArrowAutofitHeightIcon,
	ArrowAutofitWidthIcon,
	FileIcon,
	ZoomScanIcon,
} from "#/dev/icons/index.ts";
import type { Entity } from "#/engine/Entity";
import { currentScene, loadScene, type SceneData } from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { RemoteItemList } from "./RemoteItemList";

async function fetchBrowserData(dir: string): Promise<BrowserFolder> {
	const indexRef: string[] = await (await fetch(`/api/${dir}`)).json();

	const scenes = indexRef.reduce((root, entry) => {
		const [name] = entry.substring(1).split("/");
		root.set(name, { path: name, isActive: false });

		return root;
	}, new Map() as BrowserFolder);

	return new Map([[dir, scenes]]);
}

function mapSceneEntities(sceneData: SceneData): BrowserFolder {
	const sets: Record<string, number> = {};
	const entites = sceneData.entities.reduce((root, entiry) => {
		sets[entiry.name] =
			sets[entiry.name] === undefined ? 0 : sets[entiry.name] + 1;
		root.set(`${entiry.name}:${sets[entiry.name]}`, {
			path: `${entiry.name}:${sets[entiry.name]}`,
			isActive: false,
		});
		return root;
	}, new Map() as BrowserFolder);

	return new Map([["entities", entites]]);
}

const scenesRaw = await fetchBrowserData("scenes");

function adjustGameContainer(gameContainer: HTMLElement, width: number): void {
	gameContainer.style = `position: relative; top: 0; left: ${width}px; width: ${document.body.offsetWidth - width}px;`;
}

const DevTools: Component<{ gameContainer: HTMLElement }> = ({
	gameContainer,
}) => {
	const [width, setWidth] = createSignal(320);
	let isResizing = false;

	const startResizing = (): void => {
		isResizing = true;
	};

	const stopResizing = (): void => {
		isResizing = false;
	};

	const handleMouseMove = (event: MouseEvent) => {
		if (isResizing) {
			setWidth(event.clientX);
			self.dispatchEvent(new Event("resize"));
		}
	};

	adjustGameContainer(gameContainer, width());

	const [entities, setEntities] = createSignal(
		mapSceneEntities(currentScene.data),
	);

	const mapActive = (
		root: string,
		path: string,
		accessor: Accessor<BrowserFolder>,
	): BrowserFolder => {
		return new Map([
			[
				root,
				(accessor().get(root) as BrowserFolder)
					.entries()
					.reduce((acc, [key, value]) => {
						acc.set(key, {
							// @ts-ignore: value is BrowserFile
							path: value.path,
							isActive: path === key,
						});

						return acc;
					}, new Map() as BrowserFolder),
			],
		]);
	};

	let activeEntity = null;
	const setActiveEntity = (path: string): void => {
		const [id, index] = path.split(":");
		const instances = currentScene.entityInstanceMap.get(id)!.instances;
		activeEntity = instances[parseInt(index)] as Entity<unknown>;
		setEntities(mapActive("entities", path, entities));
		console.log(activeEntity);
	};

	const [scenes, setScenes] = createSignal(scenesRaw);

	const setCurrentScene = async (path: string) => {
		await loadScene(path);
		setScenes(mapActive("scenes", path, scenes));
		setEntities(mapSceneEntities(currentScene.data));
	};

	onMount(() => {
		self.addEventListener("resize", () => {
			adjustGameContainer(gameContainer, width());
		});
		self.dispatchEvent(new Event("resize"));

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", stopResizing);
	});

	return (
		<div class="dev-tools" style={{ width: `${width()}px` }}>
			<div class="tool-bar">
				<RangeSlider
					name="scale"
					min={1}
					max={8}
					step={1}
					value={viewport.initialScale}
					onInput={setScale}
				>
					<ZoomScanIcon />
				</RangeSlider>

				<div class="scene-props">
					<InputField
						name="file"
						value={currentScene.data.name}
						icon={FileIcon()}
					></InputField>
					<InputField
						type="number"
						name="width"
						value={String(currentScene.data.width)}
						icon={ArrowAutofitWidthIcon()}
						onChange={(value) => {
							currentScene.data.width = parseInt(value);
							self.dispatchEvent(new Event("resize"));
						}}
					></InputField>
					<InputField
						type="number"
						name="height"
						value={String(currentScene.data.height)}
						icon={ArrowAutofitHeightIcon()}
						onChange={(value) => {
							currentScene.data.height = parseInt(value);
							self.dispatchEvent(new Event("resize"));
						}}
					></InputField>
				</div>

				<FileBrowser root={scenes} handler={setCurrentScene} />
				<FileBrowser root={entities} handler={setActiveEntity} />

				<RemoteItemList fetchItems={async () => []} />
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
