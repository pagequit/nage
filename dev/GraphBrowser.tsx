import "./GraphBrowser.css";
import { type Component, createSignal, onMount } from "solid-js";
import {
	drawEdge,
	drawNode,
	type Graph,
	type Node,
	type PositionPartial,
} from "#/lib/Graph.ts";
import { createVector, type Vector } from "#/lib/Vector.ts";

function drawGraph<T extends PositionPartial>(
	graph: Graph<T>,
	ctx: CanvasRenderingContext2D,
): void {
	for (const [node, neighbours] of graph.entries()) {
		drawNode(node, ctx);
		for (const neighbour of neighbours) {
			drawEdge([node, neighbour], ctx);
		}
	}
}

function placeNodes<T extends PositionPartial>(graph: Graph<T>): void {
	const visited: Array<Node<T>> = [];
	const currentPosition = createVector();
	const radius = 24;

	for (const [node, neighbours] of graph.entries()) {
		if (visited.includes(node)) {
			continue;
		}
		visited.push(node);

		node.position.x = currentPosition.x;
		node.position.y = currentPosition.y;

		neighbours.forEach((neighbour, index) => {
			const fraction = (index + 1) / neighbours.length;
			const rad = Math.PI * 2 * fraction;
			neighbour.position.x = currentPosition.x + radius * Math.cos(rad);
			neighbour.position.y = currentPosition.y + radius * Math.sin(rad);
			visited.push(neighbour);
		});

		currentPosition.y += radius * 2;
	}
}

export const GraphBrowser: Component<{
	graph: Graph<{ position: Vector; label: string }>;
}> = (props) => {
	let canvasRef!: HTMLCanvasElement;

	const [width, setWidth] = createSignal(300);
	const [height, setHeight] = createSignal(300);

	onMount(() => {
		const ctx: CanvasRenderingContext2D = canvasRef.getContext("2d", {
			alpha: false,
		})!;
		ctx.translate(width() / 2, height() / 2);

		placeNodes(props.graph);
		drawGraph(props.graph, ctx);
	});

	return (
		<div class="graph-browser">
			<canvas ref={canvasRef} width={width()} height={height()}></canvas>
		</div>
	);
};
