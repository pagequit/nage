import "./GraphBrowser.css";
import { type Component, createSignal, onMount } from "solid-js";
import { createGraph, type Edge, type Graph, type Node } from "#/lib/Graph.ts";
import type { Vector } from "#/lib/Vector.ts";

export const GraphBrowser: Component<{
	graph: Graph<{ position: Vector; label: string }>;
}> = (props) => {
	let canvasRef!: HTMLCanvasElement;

	const [width, setWidth] = createSignal(100);
	const [height, setHeight] = createSignal(100);

	onMount(() => {
		const ctx: CanvasRenderingContext2D = canvasRef.getContext("2d", {
			alpha: false,
		})!;

		setWidth(canvasRef.parentElement!.offsetWidth);
		setHeight(width());
	});

	return (
		<div class="graph-browser">
			<canvas ref={canvasRef} width={width()} height={height()}></canvas>
		</div>
	);
};
