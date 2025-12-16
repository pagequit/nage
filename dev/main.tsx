import "./main.css";
import { type Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { InputField } from "#/dev/controls/InputField.tsx";
import { RangeSlider } from "#/dev/controls/RangeSlider.tsx";
import { currentScene } from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { type BrowserFolder, FileBrowser } from "./FileBrowser.tsx";
import {
	ArrowAutofitHeightIcon,
	ArrowAutofitWidthIcon,
	FileIcon,
	ZoomScanIcon,
} from "./icons/index.ts";

function sceneTreeBuilder(
	current: BrowserFolder,
	entries: string[],
	index: number,
	ref: string[],
): void {
	console.log(entries);

	const next = current.has(entries[0])
		? (current.get(entries[0]) as BrowserFolder)
		: (new Map() as BrowserFolder);

	if (entries.length > 1) {
		current.set(entries.shift() as string, next);
		sceneTreeBuilder(next, entries, index, ref);
	} else {
		// if (entries[0] !== "index.ts") {
		// 	return;
		// }
		current.set(entries[0], entries[0]);
	}
}
async function fetchSceneIndex(): Promise<BrowserFolder> {
	const indexRef: string[] = await (await fetch("/api/scenes")).json();

	return indexRef.reduce((root, entry, index) => {
		const entries = `scenes${entry}`.split("/");
		sceneTreeBuilder(root, entries, index, indexRef);

		return root;
	}, new Map() as BrowserFolder);
}

const root = await fetchSceneIndex();

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
						value={currentScene.data.id}
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

				<FileBrowser root={root} handler={console.log} />
			</div>
			<div class="tool-bar-resize" onMouseDown={startResizing}></div>
		</div>
	);
};

export function use(container: HTMLElement): void {
	render(() => <DevTools gameContainer={container} />, document.body);
}
