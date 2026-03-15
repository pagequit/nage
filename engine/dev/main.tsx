import "./main.css";
import { type Component, createEffect, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import $, {
	currentScene,
	type SceneChange,
	type SceneData,
	sceneChangeSet,
	sceneGraph,
	sceneProcessMap,
	setScene,
} from "#/engine/Scene.ts";
import { type Sprite, spriteSheetMap } from "#/engine/Sprite.ts";
import type { Vector } from "#/engine/Vector.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { InputField } from "./controls/InputField.tsx";
import { RangeSlider } from "./controls/RangeSlider.tsx";
import { GraphBrowser } from "./GraphBrowser.tsx";
import { ItemList, type ItemsRef } from "./ItemList.tsx";
import { ArrowAutofitHeightIcon } from "./icons/ArrowAutofitHeight.tsx";
import { ArrowAutofitWidthIcon } from "./icons/ArrowAutofitWidth.tsx";
import { FileIcon } from "./icons/File.tsx";
import { ZoomScanIcon } from "./icons/ZoomScan.tsx";

async function fetchScenes(): Promise<string[]> {
	const indexRef: string[] = await (await fetch(`/api/scenes`)).json();
	const items = indexRef.filter((value) => value.includes("scene"));

	return items.map((i) => i.substring(1).split("/")[0]);
}

function mapSceneEntities(sceneData: SceneData): string[] {
	return sceneData.entities.map((entity) => entity.name);
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

	const [currentScale, setCurrentScale] = createSignal(viewport.scale);
	const [sceneData, setSceneData] = createSignal(currentScene.data);
	const [scenes] = createSignal(scenesRaw);
	const [entities, setEntities] = createSignal(
		mapSceneEntities(currentScene.data),
	);

	createEffect(() => {
		setScale(currentScale());
	});

	const setCurrentScene = async (items: ItemsRef): Promise<void> => {
		const name = items.find((ref) => ref.item.isActive)!.item.label;
		await setScene(name);
	};

	sceneChangeSet.add((data) => {
		setSceneData(data);
		setEntities(mapSceneEntities(data));
	});

	const selectEntity = (items: ItemsRef): void => {
		const activeRef = items.find((ref) => ref.item.isActive)!;
		const id = `${activeRef.index}_${activeRef.item.label}`;
		const position = $<Vector>("position").get(id)!;
		const sprite = $<Sprite>("sprite").get(id)!;
		const spriteSheet = spriteSheetMap.get(sprite.value.src)!;

		const sceneProcess = sceneProcessMap.get(currentScene.data.name)!;
		const ctx = viewport.ctx;
		currentScene.process = (...args) => {
			sceneProcess(...args);

			ctx.save();
			ctx.globalAlpha = 0.75;
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#6572f5";
			ctx.strokeRect(
				position.value.x - 0.5,
				position.value.y - 0.5,
				spriteSheet.frameWidth + 1,
				spriteSheet.frameHeight + 1,
			);

			ctx.fillStyle = "#ee459e";
			ctx.fillRect(position.value.x - 1, position.value.y - 1, 2, 2);
			ctx.beginPath();
			ctx.fill();
			ctx.restore();
		};
	};

	onMount(() => {
		self.addEventListener("resize", () => {
			adjustGameContainer(gameContainer, width());
		});
		self.dispatchEvent(new Event("resize"));

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", stopResizing);

		if (location.hash) {
			const callback: SceneChange = (sceneData) => {
				const name = location.hash.substring(1);
				if (sceneData.name !== name) {
					setScene(name).catch(console.error);
				}
				sceneChangeSet.delete(callback);
			};
			sceneChangeSet.add(callback);
		}
	});

	return (
		<div class="dev-tools" style={{ width: `${width()}px` }}>
			<div class="tool-bar">
				<div class="zoom-bar">
					<button type="button" onClick={() => setCurrentScale(4)}>
						<ZoomScanIcon />
					</button>
					<RangeSlider
						name="scale"
						min={1}
						max={8}
						step={1}
						value={currentScale()}
						onInput={(value) => setCurrentScale(value)}
					></RangeSlider>
					<span>{currentScale()}</span>
				</div>

				<div class="scene-props">
					<InputField
						name="file"
						value={sceneData().name}
						icon={FileIcon()}
					></InputField>
					<InputField
						type="number"
						name="width"
						value={String(sceneData().width)}
						icon={ArrowAutofitWidthIcon()}
						onChange={(value) => {
							currentScene.data.width = parseInt(value);
							self.dispatchEvent(new Event("resize"));
						}}
					></InputField>
					<InputField
						type="number"
						name="height"
						value={String(sceneData().height)}
						icon={ArrowAutofitHeightIcon()}
						onChange={(value) => {
							currentScene.data.height = parseInt(value);
							self.dispatchEvent(new Event("resize"));
						}}
					></InputField>
				</div>

				<ItemList name="Scenes" handler={setCurrentScene} items={scenes} />
				<GraphBrowser graph={sceneGraph} seed={2802446152} />

				<ItemList name="Entities" handler={selectEntity} items={entities} />
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
