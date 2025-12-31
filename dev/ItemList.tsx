import "./ItemList.css";
import {
	type Accessor,
	type Component,
	createEffect,
	createSignal,
	For,
	Match,
	Show,
	type Signal,
	Switch,
} from "solid-js";
import {
	ArrowNarrowDownIcon,
	ArrowNarrowUpIcon,
	ArrowsSortIcon,
	ChevronDownIcon,
} from "#/dev/icons/index.ts";

export type ListItem = { label: string; isActive: boolean };

export type ItemsRef = Array<{ item: ListItem; index: number }>;

export type ItemHandler = (items: ItemsRef) => void;

export type Direction = "default" | "asc" | "desc";

function mapActiveItem(items: ItemsRef, index: number): ItemsRef {
	return items.map((ref, idx) => ({
		item: {
			...ref.item,
			isActive: idx === index,
		},
		index: ref.index,
	}));
}

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

function createItemsRef(items: Array<ListItem>): ItemsRef {
	return items.map((item, index) => ({
		item,
		index,
	}));
}

export const ItemList: Component<{
	name: string;
	items: Accessor<string[]>;
	handler: ItemHandler;
}> = (props) => {
	const [showList, setShowList] = createSignal(true);
	const [items, setItems] = createSignal(
		createItemsRef(props.items().map((i) => ({ label: i, isActive: false }))),
	);
	const [direction, toggleDirection] = useDirection(
		createSignal<Direction>("default"),
	);

	createEffect(() => {
		sortItems(
			createItemsRef(props.items().map((i) => ({ label: i, isActive: false }))),
			direction(),
		);
	});

	const sortItems = (items: ItemsRef, direction: Direction) => {
		const newItems = [...items];
		if (direction === "default") {
			newItems.sort((a, b) => a.index - b.index);
			setItems(newItems);
			return;
		}

		newItems.sort((a, b) => {
			const labelA = a.item.label.toLocaleLowerCase();
			const labelB = b.item.label.toLocaleLowerCase();

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
		<div class="item-list">
			<div class="item-list-header">
				<div
					class="item-list-name"
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
				<ul>
					<For each={items()}>
						{(ref, index) => {
							return (
								<li
									classList={{
										active: ref.item.isActive,
									}}
									onClick={() => {
										const newItems = mapActiveItem(items(), index());
										setItems(newItems);
										props.handler(newItems);
									}}
								>
									{ref.item.label}
								</li>
							);
						}}
					</For>
				</ul>
			</Show>
		</div>
	);
};
