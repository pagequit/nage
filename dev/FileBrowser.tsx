import "./FileBrowser.css";
import {
	type Accessor,
	type Component,
	createSignal,
	For,
	Show,
} from "solid-js";
import { FileIcon, FolderIcon, FolderOpenIcon } from "#/dev/icons/index.ts";

export type BrowserFolder = Map<string, string | BrowserFolder>;

export type FileHandler = (path: string) => void;

function isFolder(entry: string | BrowserFolder): entry is BrowserFolder {
	return typeof (entry as BrowserFolder).size === "number";
}

export const FileBrowser: Component<{
	root: Accessor<BrowserFolder>;
	handler: FileHandler;
}> = (props) => {
	const FileEntry: Component<{
		name: string;
		path: string;
	}> = ({ name, path }) => {
		return (
			<div class="file-label" onClick={[props.handler, path]}>
				<FileIcon />
				<span>{name}</span>
			</div>
		);
	};

	const FolderEntry: Component<{
		folder: BrowserFolder;
		name: string;
		open: boolean;
	}> = ({ folder, name, open }) => {
		const [isOpen, setIsOpen] = createSignal(open);

		return (
			<>
				<div class="file-label" onClick={() => setIsOpen(!isOpen())}>
					{isOpen() ? <FolderOpenIcon /> : <FolderIcon />}
					<span>{name}</span>
				</div>

				<Show when={isOpen()}>
					<FileList folder={folder} />
				</Show>
			</>
		);
	};

	const FileList: Component<{ folder: BrowserFolder }> = (props) => {
		return (
			<ul class="file-list">
				<For each={[...props.folder.entries()]}>
					{(item, index) => {
						const [name, entry] = item;

						return (
							<li class="file-item">
								{isFolder(entry) ? (
									<FolderEntry folder={entry} name={name} open={index() < 1} />
								) : (
									<FileEntry name={name} path={entry} />
								)}
							</li>
						);
					}}
				</For>
			</ul>
		);
	};

	return (
		<div class="file-browser">
			<FileList folder={props.root()} />
		</div>
	);
};
