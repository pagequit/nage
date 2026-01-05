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
import {
	createVector,
	getDistance,
	scale,
	setDistanceNormal,
	type Vector,
} from "#/lib/Vector.ts";

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

type PhysicsPartial = PositionPartial & {
	velocity: Vector;
	acceleration: Vector;
};

function applyRepulsion(nodes: Array<PhysicsPartial>): void {
	const strength = 1.8;

	nodes.forEach((node, index) => {
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

			const magnitude = strength / (distanceSquare + Number.EPSILON);

			scale(direction, magnitude);

			node.acceleration.x += direction.x;
			node.acceleration.y += direction.y;
		}
	});
}

function doTheHookeThing<T extends PhysicsPartial>([a, b]: Edge<T>): void {
	const restLength = 48;
	const stiffness = 0.3;

	const direction = createVector(0, 0);
	setDistanceNormal(direction, a.position, b.position);

	const distance = getDistance(a.position, b.position);
	const magnitude = (distance - restLength) * stiffness;

	scale(direction, magnitude / 2 + Number.EPSILON);

	a.acceleration.x -= direction.x;
	a.acceleration.y -= direction.y;

	b.acceleration.x += direction.x;
	b.acceleration.y += direction.y;
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
	graph: Graph<PhysicsPartial & { label: string }>;
}> = (props) => {
	let canvasRef!: HTMLCanvasElement;

	const [width, setWidth] = createSignal(300);
	const [height, setHeight] = createSignal(300);

	// placeNodes(props.graph);

	const nodes: Array<Node<PhysicsPartial>> = [...props.graph.keys()];

	const edges: Array<Edge<PhysicsPartial>> = props.graph.entries().reduce(
		(acc, [node, neighbours]) => {
			for (const neighbour of neighbours) {
				acc.push([node, neighbour]);
			}
			return acc;
		},
		[] as Array<Edge<PhysicsPartial>>,
	);

	onMount(() => {
		const ctx: CanvasRenderingContext2D = canvasRef.getContext("2d", {
			alpha: false,
		})!;

		const damping = 0.9;

		let then = self.performance.now();
		let delta = 0;
		const animate = (timestamp: number): void => {
			delta = timestamp - then;
			then = timestamp;

			applyRepulsion(nodes);
			for (const edge of edges) {
				doTheHookeThing(edge);
			}

			for (const node of nodes) {
				node.velocity.x += node.acceleration.x;
				node.velocity.y += node.acceleration.y;

				node.velocity.x *= damping;
				node.velocity.y *= damping;

				node.position.x += node.velocity.x;
				node.position.y += node.velocity.y;

				node.acceleration.x = 0;
				node.acceleration.y = 0;
			}

			ctx.restore();
			ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
			ctx.save();
			ctx.translate(width() / 2, height() / 2);

			drawGraph(props.graph, ctx);

			requestAnimationFrame(animate);
		};

		animate(then);
	});

	return (
		<div class="graph-browser">
			<canvas ref={canvasRef} width={width()} height={height()}></canvas>
		</div>
	);
};
