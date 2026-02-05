export type Node<T> = T;
export type Edge<T> = [Node<T>, Node<T>];
export type Graph<T> = Map<Node<T>, Array<Node<T>>>;

export function createGraph<T>(
	nodes: Array<Node<T>>,
	edges: Array<Edge<T>>,
): Graph<T> {
	const graph: Graph<T> = new Map();

	for (const node of nodes) {
		const neighbours = edges.reduce(
			(acc, edge) => {
				if (edge[0] === node) {
					acc.push(edge[1]);
					return acc;
				}

				if (edge[1] === node) {
					acc.push(edge[0]);
					return acc;
				}

				return acc;
			},
			[] as Array<Node<T>>,
		);

		if (neighbours.length > 0) {
			graph.set(node, neighbours);
		}
	}

	return graph;
}

export function originDFS<T>(origin: Node<T>, graph: Graph<T>): Array<Node<T>> {
	const visited: Array<Node<T>> = [origin];
	if (!graph.has(origin)) {
		return visited;
	}
	innerDFS(origin, graph, visited);

	return visited;
}

function innerDFS<T>(
	node: Node<T>,
	graph: Graph<T>,
	visited: Array<Node<T>>,
): void {
	const neighbours = graph.get(node)!;
	for (const node of neighbours) {
		if (visited.includes(node)) {
			continue;
		}

		visited.push(node);
		innerDFS(node, graph, visited);
	}
}

export function getNeighbours<T>(
	graph: Graph<T>,
	node: Node<T>,
): Array<Node<T>> {
	return graph.has(node) ? graph.get(node)! : [];
}
