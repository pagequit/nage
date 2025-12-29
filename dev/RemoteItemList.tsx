import "./RemoteItemList.css";
import { type Component, createSignal, Match, Show, Switch } from "solid-js";
import {
	type Direction,
	type ItemHandler,
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
	name: string;
	fetch: () => Promise<Array<ListItem>>;
	handler: ItemHandler;
}> = (props) => {
	const [showList, setShowList] = createSignal(true);
	const [items, setItems] = createSignal<Array<ListItem>>([]);
	const [direction, setDirection] = createSignal<Direction>("default");
	const [sorted, setSorted] = useSort([]);
	const toggleDirection = useDirection();

	const fetchItems = () => {
		props.fetch().then((items) => {
			setSorted(items);
			setItems(sorted(direction()));
		});
	};
	fetchItems();

	return (
		<div class="remote-item-list">
			<div class="remote-item-list-header">
				<div
					class="remote-item-list-name"
					classList={{
						hide: !showList(),
					}}
					role="button"
					onClick={() => setShowList(!showList())}
				>
					{props.name}
					<ChevronDownIcon />
				</div>
				<button
					type="button"
					onClick={() => {
						const direction = toggleDirection();
						setDirection(direction);
						setItems(sorted(direction));
					}}
				>
					<Switch fallback={<ArrowsSortIcon />}>
						<Match when={direction() === "asc"}>
							<ArrowNarrowUpIcon />
						</Match>
						<Match when={direction() === "desc"}>
							<ArrowNarrowDownIcon />
						</Match>
					</Switch>
				</button>
				<button type="button" onClick={fetchItems}>
					<ReloadIcon />
				</button>
			</div>
			<Show when={showList()}>
				<ItemList items={items} handler={props.handler} />
			</Show>
		</div>
	);
};
