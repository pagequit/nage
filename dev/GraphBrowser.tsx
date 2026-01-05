import "./GraphBrowser.css";
import { type Component, createSignal, onMount } from "solid-js";
import {
	type Edge,
	type Graph,
	getNeighbours,
	type Node,
} from "#/lib/Graph.ts";
import {
	createVector,
	getDistance,
	scale,
	setDistanceNormal,
	type Vector,
} from "#/lib/Vector.ts";

type PhysicsPartial = {
	position: Vector;
	velocity: Vector;
	acceleration: Vector;
};

function drawNode(
	node: Node<PhysicsPartial>,
	ctx: CanvasRenderingContext2D,
	color: string = "#dbdee1",
): void {
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.arc(node.position.x, node.position.y, 8, 0, 2 * Math.PI);
	ctx.stroke();
}

function drawEdge(
	edge: Edge<PhysicsPartial>,
	ctx: CanvasRenderingContext2D,
	color: string = "#dbdee1",
): void {
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(edge[0].position.x, edge[0].position.y);
	ctx.lineTo(edge[1].position.x, edge[1].position.y);
	ctx.stroke();
}

function applyRepulsion(nodes: Array<PhysicsPartial>): void {
	const strength = 8;

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

function hookEdge<T extends PhysicsPartial>([a, b]: Edge<T>): void {
	const restLength = 48;
	const stiffness = 0.1;

	const direction = createVector();
	setDistanceNormal(direction, a.position, b.position);

	const distance = getDistance(a.position, b.position);
	const magnitude = (distance - restLength) * stiffness + Number.EPSILON;

	scale(direction, magnitude);

	a.acceleration.x -= direction.x;
	a.acceleration.y -= direction.y;

	b.acceleration.x += direction.x;
	b.acceleration.y += direction.y;
}

export const GraphBrowser: Component<{
	graph: Graph<PhysicsPartial & { label: string }>;
}> = (props) => {
	let canvasRef!: HTMLCanvasElement;

	const [width] = createSignal(300);
	const [height] = createSignal(300);

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

		const damping = 0.8;

		const activeNode = props.graph.keys().find((_, i) => i === 3);
		const activeNeighbours = getNeighbours(props.graph, activeNode);

		const animate = (): void => {
			applyRepulsion(nodes);
			for (const edge of edges) {
				hookEdge(edge);
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

			for (const edge of edges) {
				drawEdge(edge, ctx, "#404249");
			}

			for (const node of nodes) {
				if (node === activeNode) {
					drawNode(node, ctx, "#ee459e");
				} else {
					if (
						activeNeighbours.includes(
							node as PhysicsPartial & { label: string },
						)
					) {
						drawNode(node, ctx, "#6572f5");
					} else {
						drawNode(node, ctx, "#404249");
					}
				}
			}

			requestAnimationFrame(animate);
		};

		animate();
	});

	return (
		<div class="graph-browser">
			<canvas ref={canvasRef} width={width()} height={height()}></canvas>
		</div>
	);
};
