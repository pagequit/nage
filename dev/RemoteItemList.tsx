import "./RemoteItemList.css";
import {
	type Accessor,
	type Component,
	createEffect,
	createSignal,
	Match,
	Show,
	type Signal,
	Switch,
} from "solid-js";
import { type ItemHandler, ItemList, type ListItem } from "#/dev/ItemList.tsx";
import {
	ArrowNarrowDownIcon,
	ArrowNarrowUpIcon,
	ArrowsSortIcon,
	ChevronDownIcon,
} from "#/dev/icons/index.ts";

export type Direction = "default" | "asc" | "desc";

function useDirection(
	signal: Signal<Direction>,
): [Accessor<Direction>, (forcedDirection?: Direction) => Direction] {
	const [direction, setDirection] = signal;

	return [
		direction,
		(forcedDirection) => {
			if (forcedDirection) {
				setDirection(forcedDirection);
				return direction();
			}

			switch (direction()) {
				case "asc": {
					setDirection("desc");
					break;
				}
				case "desc": {
					setDirection("default");
					break;
				}
				default: {
					setDirection("asc");
				}
			}

			return direction();
		},
	];
}

export const RemoteItemList: Component<{
	name: string;
	items: Accessor<Array<ListItem>>;
	handler: ItemHandler;
}> = (props) => {
	const [showList, setShowList] = createSignal(true);
	const [items, setItems] = createSignal([...props.items()]);
	const [direction, toggleDirection] = useDirection(
		createSignal<Direction>("default"),
	);

	createEffect(() => {
		sortItems(props.items(), direction());
	});

	const sortItems = (items: Array<ListItem>, direction: Direction) => {
		if (direction === "default") {
			setItems([...props.items()]);
			return;
		}

		const newItems = [...items];
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

		setItems(newItems);
	};

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
						sortItems(items(), toggleDirection());
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
			</div>
			<Show when={showList()}>
				<ItemList items={items} handler={props.handler} />
			</Show>
		</div>
	);
};
