import "./main.css";
import { type Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { InputField } from "#/dev/controls/InputField.tsx";
import { RangeSlider } from "#/dev/controls/RangeSlider.tsx";
import { ItemList, type ItemsRef } from "#/dev/ItemList.tsx";
import {
	ArrowAutofitHeightIcon,
	ArrowAutofitWidthIcon,
	FileIcon,
	ZoomScanIcon,
} from "#/dev/icons/index.ts";
import { currentScene, loadScene, type SceneData } from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { createGraph, type Edge, type Node } from "#/lib/Graph.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";
import { GraphBrowser } from "./GraphBrowser.tsx";

async function fetchScenes(): Promise<string[]> {
	const indexRef: string[] = await (await fetch(`/api/scenes`)).json();
	const items = indexRef.filter((value) => value.includes("index"));

	return items.map((i) => i.substring(1).split("/")[0]);
}

function mapSceneEntities(sceneData: SceneData): string[] {
	return sceneData.entities.map((entity) => entity.name);
}

function adjustGameContainer(gameContainer: HTMLElement, width: number): void {
	gameContainer.style = `position: relative; top: 0; left: ${width}px; width: ${document.body.offsetWidth - width}px;`;
}

const scenesRaw = await fetchScenes();

type TestNode = Node<{
	position: Vector;
	velocity: Vector;
	acceleration: Vector;
	label: string;
}>;

function createTestNode(label: string): TestNode {
	return {
		label,
		position: createVector(Math.random(), Math.random()),
		velocity: createVector(),
		acceleration: createVector(),
	};
}

const nodes: Array<TestNode> = [
	createTestNode("foo"),
	createTestNode("bar"),
	createTestNode("lol"),
	createTestNode("hai"),
	createTestNode("sea"),
	createTestNode("vot"),
	createTestNode("zoe"),
	createTestNode("asm"),
];

const edges: Array<Edge<TestNode>> = [
	[nodes[0], nodes[1]],
	[nodes[0], nodes[2]],
	[nodes[1], nodes[2]],
	[nodes[2], nodes[3]],
	[nodes[4], nodes[5]],
	[nodes[4], nodes[3]],
	[nodes[5], nodes[6]],
	[nodes[3], nodes[6]],
];

const graph = createGraph<TestNode>(nodes, edges);

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

	const [scenes] = createSignal(scenesRaw);
	const [entities, setEntities] = createSignal(
		mapSceneEntities(currentScene.data),
	);

	const setCurrentScene = async (items: ItemsRef): Promise<void> => {
		const name = items.find((ref) => ref.item.isActive)!.item.label;
		await loadScene(name);
		setEntities(mapSceneEntities(currentScene.data));
	};

	const setActiveEntity = (items: ItemsRef): void => {
		const activeRef = items.find((ref) => ref.item.isActive)!;
		const instances = currentScene.entityInstanceMap.get(
			activeRef.item.label,
		)!.instances;

		const entityRefs = items.filter(
			(ref) => ref.item.label === activeRef.item.label,
		);
		const instance =
			instances[entityRefs.findIndex((ref) => ref.item.isActive)];

		console.log(instance.position);
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

				<GraphBrowser graph={graph} />
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
