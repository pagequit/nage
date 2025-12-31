import "./main.css";
import { type Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { InputField } from "#/dev/controls/InputField.tsx";
import { RangeSlider } from "#/dev/controls/RangeSlider.tsx";
import { ItemList, type ListItem, mapActiveItem } from "#/dev/ItemList.tsx";
import {
	ArrowAutofitHeightIcon,
	ArrowAutofitWidthIcon,
	FileIcon,
	ZoomScanIcon,
} from "#/dev/icons/index.ts";
import { currentScene, loadScene, type SceneData } from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";

async function fetchScenes(): Promise<Array<ListItem>> {
	const indexRef: string[] = await (await fetch(`/api/scenes`)).json();
	const items = indexRef.filter((value) => value.includes("index"));

	return items.map((value) => {
		const [label] = value.substring(1).split("/");
		return { label, isActive: false };
	});
}

function mapSceneEntities(sceneData: SceneData): Array<ListItem> {
	const sets: Record<string, number> = {};
	return sceneData.entities.map((entity, index) => {
		sets[entity.name] =
			sets[entity.name] === undefined ? 0 : sets[entity.name] + 1;
		return {
			label: entity.name,
			isActive: false,
			index,
		};
	});
}

function adjustGameContainer(gameContainer: HTMLElement, width: number): void {
	gameContainer.style = `position: relative; top: 0; left: ${width}px; width: ${document.body.offsetWidth - width}px;`;
}

const scenesRaw = await fetchScenes();

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

	const [scenes, setScenes] = createSignal(
		scenesRaw.map((scene) => ({
			...scene,
			isActive: scene.label === currentScene.data.name,
		})),
	);
	const [entities, setEntities] = createSignal(
		mapSceneEntities(currentScene.data),
	);

	const setCurrentScene = async (
		items: Array<ListItem>,
		index: number,
	): Promise<void> => {
		setScenes(mapActiveItem(items, index));

		await loadScene(items[index].label);
		setEntities(mapSceneEntities(currentScene.data));
	};

	const setActiveEntity = (items: Array<ListItem>, index: number): void => {
		const entities = mapActiveItem(items, index);
		setEntities(entities);

		const entityName = items[index].label;
		const instances = currentScene.entityInstanceMap.get(entityName)!.instances;

		let instanceIndex = 0;
		let indexCount = 0;
		for (const item of entities) {
			if (item.label === entityName) {
				if (item.isActive) {
					instanceIndex = indexCount;
				}
				indexCount += 1;
			}
		}

		console.log(instances[instanceIndex].position);
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

				<ItemList name="Scenes" handler={setCurrentScene} items={scenes} />
				<ItemList name="Entities" handler={setActiveEntity} items={entities} />
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
