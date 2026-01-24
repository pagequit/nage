import "./main.css";
import {
	type Component,
	createEffect,
	createSignal,
	onMount,
	Show,
} from "solid-js";
import { render } from "solid-js/web";
import { InputField } from "#/dev/controls/InputField.tsx";
import { RangeSlider } from "#/dev/controls/RangeSlider.tsx";
import { ItemList, type ItemsRef } from "#/dev/ItemList.tsx";
import { ArrowAutofitHeightIcon } from "#/dev/icons/ArrowAutofitHeight.tsx";
import { ArrowAutofitWidthIcon } from "#/dev/icons/ArrowAutofitWidth.tsx";
import { FileIcon } from "#/dev/icons/File.tsx";
import { LetterXIcon } from "#/dev/icons/LetterX.tsx";
import { LetterYIcon } from "#/dev/icons/LetterY.tsx";
import { ZoomScanIcon } from "#/dev/icons/ZoomScan.tsx";
import { type Animation, spriteMap } from "#/engine/Animation.ts";
import type { Entity } from "#/engine/Entity.ts";
import {
	currentScene,
	type SceneData,
	sceneChangedHandlers,
	sceneGraph,
	sceneProcessMap,
	setScene,
} from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { GraphBrowser } from "./GraphBrowser.tsx";

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
	const [activeEntity, setActiveEntity] = createSignal<null | Entity<unknown>>(
		null,
	);

	createEffect(() => {
		setScale(currentScale());
	});

	const setCurrentScene = async (items: ItemsRef): Promise<void> => {
		const name = items.find((ref) => ref.item.isActive)!.item.label;
		await setScene(name);
	};

	sceneChangedHandlers.add((data) => {
		setActiveEntity(null);
		setSceneData(data);
		setEntities(mapSceneEntities(data));
	});

	const selectEntity = (items: ItemsRef): void => {
		const activeRef = items.find((ref) => ref.item.isActive)!;
		const instances = currentScene.entityInstanceMap.get(
			activeRef.item.label,
		)!.instances;

		const entityRefs = items.filter(
			(ref) => ref.item.label === activeRef.item.label,
		);
		const instance =
			instances[entityRefs.findIndex((ref) => ref.item.isActive)];

		setActiveEntity(instance);
		const sprite = spriteMap.get(instance.animation.spriteSrc)!;

		const processProxy = sceneProcessMap.get(currentScene.data.name)!;
		const ctx = viewport.ctx;
		currentScene.process = (...args) => {
			processProxy(...args);

			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#6572f5";
			viewport.ctx.strokeRect(
				instance.position.x - 0.5,
				instance.position.y - 0.5,
				sprite.image.width / sprite.xFrames + 1,
				sprite.image.height / sprite.yFrames + 1,
			);

			ctx.fillStyle = "#ee459e";
			viewport.ctx.fillRect(
				instance.position.x - 1,
				instance.position.y - 1,
				2,
				2,
			);
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
				<GraphBrowser graph={sceneGraph} seed={1300346452} />

				<ItemList name="Entities" handler={selectEntity} items={entities} />

				<Show when={activeEntity() !== null}>
					<div class="entity-props">
						<InputField
							type="number"
							name="x"
							value={String(activeEntity()!.position.x)}
							icon={LetterXIcon()}
							onChange={(value) => {
								activeEntity()!.position.x = parseInt(value);
							}}
						></InputField>
						<InputField
							type="number"
							name="y"
							value={String(activeEntity()!.position.y)}
							icon={LetterYIcon()}
							onChange={(value) => {
								activeEntity()!.position.y = parseInt(value);
							}}
						></InputField>
					</div>
				</Show>
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
