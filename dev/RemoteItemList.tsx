import "./RemoteItemList.css";
import { type Component, createSignal } from "solid-js";
import {
	ItemList,
	type ListItem,
	useDirection,
	useSort,
} from "#/dev/ItemList.tsx";
import {
	ArrowNarrowDownIcon,
	ArrowNarrowUpIcon,
	ArrowsSortIcon,
	ChevronDownIcon,
	ReloadIcon,
} from "#/dev/icons/index.ts";

export const RemoteItemList: Component<{
	fetchItems: () => Promise<Array<ListItem>>;
}> = () => {
	const [items, setItems] = createSignal<Array<ListItem>>([
		{
			label: "foo",
			isActive: false,
		},
		{
			label: "bar",
			isActive: false,
		},
		{
			label: "lol",
			isActive: true,
		},
	]);
	const getSorted = useSort(items());
	const toggleDirection = useDirection();

	return (
		<div class="remote-item-list">
			<div class="remote-item-list-header">
				<div class="remote-item-list-label" role="button">
					Items
					<ChevronDownIcon />
				</div>
				<button
					type="button"
					onClick={() => {
						setItems(getSorted(toggleDirection()));
					}}
				>
					<ArrowsSortIcon />
				</button>
				<button type="button">
					<ReloadIcon />
				</button>
			</div>
			<ItemList items={items} handler={console.log} />
		</div>
	);
};
