import "./GraphBrowser.css";
import { type Component, createSignal, onMount } from "solid-js";
import {
	drawEdge,
	drawNode,
	type Edge,
	type Graph,
	type Node,
	type PositionPartial,
} from "#/lib/Graph.ts";
import { createVector, scale, type Vector } from "#/lib/Vector.ts";

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

function applyRepulsion(
	nodes: Array<{ position: Vector; velocity: Vector }>,
): void {
	const strength = 16;

	nodes.forEach((node, index) => {
		node.velocity = createVector(0, 0);
		for (let i = 0; i < nodes.length; i++) {
			if (index === i) {
				continue;
			}
			const a = node.position;
			const b = nodes[i].position;

			const dx = a.x - b.x;
			const dy = a.y - b.y;

			const direction = createVector(dx, dy);

			const distanceSquare = dx * dx + dy * dy;

			const magnitude = strength / distanceSquare;

			scale(direction, magnitude);

			node.velocity.x += direction.x;
			node.velocity.y += direction.y;
		}
	});
}

function doTheHookeThing<T extends { position: Vector; velocity: Vector }>([
	a,
	b,
]: Edge<T>): void {
	const edgeLength = 32;
	const stiffness = 0.8;
	const displacement = 0;
	const f = stiffness * displacement;
}

function placeNodes<T extends PositionPartial>(graph: Graph<T>): void {
	const visited: Array<Node<T>> = [];
	const currentPosition = createVector();
	const radius = 24;
	const dist = radius * 1.5;

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

			neighbour.position.x = currentPosition.x + dist * Math.cos(rad);
			neighbour.position.y = currentPosition.y + dist * Math.sin(rad);
			visited.push(neighbour);
		});

		currentPosition.y += dist;
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
