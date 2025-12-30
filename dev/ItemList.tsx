import "./ItemList.css";
import { type Accessor, type Component, For } from "solid-js";

export type ListItem = { label: string; isActive: boolean };

export type ItemHandler = (item: ListItem, index: number) => void;

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
