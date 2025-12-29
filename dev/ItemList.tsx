import "./ItemList.css";
import { type Accessor, type Component, For } from "solid-js";

export type ListItem = { label: string; isActive: boolean };

export type ItemHandler = (item: ListItem, index: number) => void;

export type Direction = undefined | "asc" | "desc";

export function useSort(
	items: Array<ListItem>,
): (direction?: Direction) => Array<ListItem> {
	const itemsRef = [...items];

	return (direction) => {
		if (!direction) {
			return [...itemsRef];
		}
		const newItems = [...itemsRef];

		newItems.sort((a, b) => {
			const labelA = a.label.toLocaleLowerCase();
			const labelB = b.label.toLocaleLowerCase();

			if (labelA < labelB) {
				return direction === "asc" ? -1 : 1;
			}

			if (labelA > labelB) {
				return direction === "asc" ? 1 : -1;
			}

			return 0;
		});

		return newItems;
	};
}

export function useDirection(initialDirection?: Direction): () => Direction {
	let direction: Direction = initialDirection;

	return () => {
		switch (direction) {
			case "asc": {
				direction = "desc";
				break;
			}
			case "desc": {
				direction = undefined;
				break;
			}
			default: {
				direction = "asc";
			}
		}

		return direction;
	};
}

export const ItemList: Component<{
	items: Accessor<Array<ListItem>>;
	handler: ItemHandler;
}> = (props) => (
	<ul class="item-list">
		<For each={props.items()}>
			{(item, index) => {
				return (
					<li
						class="item-list-item"
						classList={{
							active: item.isActive,
						}}
						onClick={() => props.handler(item, index())}
					>
						{item.label}
					</li>
				);
			}}
		</For>
	</ul>
);
