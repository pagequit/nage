import "./GraphBrowser.css";
import { type Component, createSignal, onMount } from "solid-js";
import { currentScene } from "#/engine/Scene.ts";
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
	const text = (node as PhysicsPartial & { name: string }).name;
	const metrics = ctx.measureText(text);

	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.arc(
		node.position.x - metrics.width / 2,
		node.position.y,
		11,
		Math.PI * 0.5,
		Math.PI * 1.5,
	);
	ctx.arc(
		node.position.x + metrics.width / 2,
		node.position.y,
		11,
		-Math.PI * 0.5,
		-Math.PI * 1.5,
	);
	ctx.fill();

	ctx.shadowColor = "#000";
	ctx.fillStyle = "#fff";
	ctx.fillText(text, node.position.x, node.position.y);
	ctx.shadowColor = "transparent";
}

function drawEdge(
	edge: Edge<PhysicsPartial>,
	ctx: CanvasRenderingContext2D,
	color: string = "#dbdee1",
): void {
	const tail = edge[0].position;
	const tip = edge[1].position;

	ctx.lineWidth = 2;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.moveTo(tail.x, tail.y);
	ctx.lineTo(tip.x, tip.y);
	ctx.stroke();
}

function applyRepulsion(nodes: Array<PhysicsPartial>): void {
	const strength = 4;

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
	const restLength = 86;
	const stiffness = 0.05;

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
	graph: Graph<string>;
}> = (props) => {
	let canvasRef!: HTMLCanvasElement;

	const [width] = createSignal(300);
	const [height] = createSignal(300);

	const enhanceNode = (node: string) => {
		return {
			name: node,
			position: createVector(Math.random() * 128 - 64, Math.random() * 32 - 16),
			velocity: createVector(),
			acceleration: createVector(),
		};
	};

	const nodes: Array<Node<PhysicsPartial & { name: string }>> = [];

	let edges: Array<Edge<PhysicsPartial>> = [];
	const updateEdges = () => {
		edges = props.graph.entries().reduce(
			(acc, [name, neighbours]) => {
				const node = nodes.find((n) => n.name === name)!;
				for (const neighbour of neighbours) {
					const n = nodes.find((node) => node.name === neighbour);
					if (n !== undefined) {
						acc.push([node, n]);
					}
				}
				return acc;
			},
			[] as Array<Edge<PhysicsPartial>>,
		);
	};

	onMount(() => {
		const ctx: CanvasRenderingContext2D = canvasRef.getContext("2d", {
			alpha: false,
		})!;

		ctx.font = "18px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowBlur = 2;

		const damping = 0.8;
		const animate = (): void => {
			for (const node of props.graph.keys()) {
				if (nodes.find((n) => n.name === node) === undefined) {
					nodes.push(enhanceNode(node));
					updateEdges();
				}
			}

			const activeNode = props.graph
				.keys()
				.find((name) => name === currentScene.data.name);
			const activeNeighbours = getNeighbours(props.graph, activeNode!);

			applyRepulsion(nodes);
			for (const edge of edges) {
				hookEdge(edge);
			}

			let absV = 0;
			for (const node of nodes) {
				node.velocity.x += node.acceleration.x;
				node.velocity.y += node.acceleration.y;

				node.velocity.x *= damping;
				node.velocity.y *= damping;

				node.position.x += node.velocity.x;
				node.position.y += node.velocity.y;

				node.acceleration.x = 0;
				node.acceleration.y = 0;

				absV = Math.abs(node.velocity.x) + Math.abs(node.velocity.y);
			}

			if (absV < 0.01) {
				ctx.restore();
				ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
				ctx.save();
				const activeRenderNode = nodes.find((n) => n.name === activeNode);
				if (!activeRenderNode) {
					setTimeout(animate, 100);
					return;
				}

				ctx.translate(
					width() / 2 - activeRenderNode.position.x,
					height() / 2 - activeRenderNode.position.y,
				);

				for (const edge of edges) {
					drawEdge(edge, ctx);
				}

				for (const node of nodes) {
					if (activeNeighbours.includes(node.name)) {
						drawNode(node, ctx, "#6572f5");
					} else {
						drawNode(node, ctx, "#404249");
					}
				}
				drawNode(activeRenderNode, ctx, "#ee459e");

				setTimeout(animate, 100);
			} else {
				animate();
			}
		};
		animate();
	});

	return (
		<div class="graph-browser">
			<canvas ref={canvasRef} width={width()} height={height()}></canvas>
		</div>
	);
};
