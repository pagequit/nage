import "./FileBrowser.css";
import {
	type Accessor,
	type Component,
	createSignal,
	For,
	Show,
} from "solid-js";
import { FileIcon } from "#/dev/icons/File.tsx";
import { FolderIcon } from "#/dev/icons/Folder.tsx";
import { FolderOpenIcon } from "#/dev/icons/FolderOpen.tsx";

export type BrowserFile = {
	path: string;
	isActive: boolean;
};

export type BrowserFolder = Map<string, BrowserFile | BrowserFolder>;

export type FileHandler = (path: string) => void;

function isFolder(entry: BrowserFile | BrowserFolder): entry is BrowserFolder {
	return typeof (entry as BrowserFolder).size === "number";
}

export const FileBrowser: Component<{
	root: Accessor<BrowserFolder>;
	handler: FileHandler;
}> = (props) => {
	const FileEntry: Component<{
		name: string;
		entry: BrowserFile;
	}> = ({ name, entry }) => {
		return (
			<div
				class="file-browser-label"
				classList={{
					active: entry.isActive,
				}}
				onClick={() => props.handler(entry.path)}
			>
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
				<div class="file-browser-label" onClick={() => setIsOpen(!isOpen())}>
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
			<ul class="file-browser-list">
				<For each={[...props.folder.entries()]}>
					{(item, index) => {
						const [name, entry] = item;

						return (
							<li class="file-browser-item">
								{isFolder(entry) ? (
									<FolderEntry folder={entry} name={name} open={index() < 1} />
								) : (
									<FileEntry name={name} entry={entry} />
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
