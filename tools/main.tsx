import "./main.css";
import { type Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { currentScene } from "#/engine/Scene.ts";
import { setScale, viewport } from "#/engine/Viewport.ts";
import { InputField } from "#/tools/controls/InputField.tsx";
import { RangeSlider } from "#/tools/controls/RangeSlider.tsx";
import { type BrowserFolder, FileBrowser } from "./FileBrowser.tsx";
import {
	ArrowAutofitHeightIcon,
	ArrowAutofitWidthIcon,
	FileIcon,
	ZoomScanIcon,
} from "./icons/index.ts";

const root = new Map<string, string | BrowserFolder>([
	[
		"Brrr",
		new Map<string, string | BrowserFolder>([
			[
				"folder",
				new Map<string, string | BrowserFolder>([
					["fuzz", "/fuzz.file"],
					["buzz", "/buzz.file"],
				]),
			],
			["dnd:", "/dnd.file"],
			["bla", "/bla.file"],
		]),
	],
	[
		"folder",
		new Map<string, string | BrowserFolder>([
			["fuzz", "/fuzz.file"],
			["buzz", "/buzz.file"],
		]),
	],
	["foo", "/foo.file"],
	["bar", "/bar.file"],
]);

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
