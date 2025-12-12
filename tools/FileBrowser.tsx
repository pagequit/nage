import "./FileBrowser.css";
import { type Component, createSignal, Index, Show } from "solid-js";
import { FileIcon, FolderIcon, FolderOpenIcon } from "./icons/index.ts";

export type BrowserFile = { path: string };

export type BrowserFolder = Map<string, BrowserFile | BrowserFolder>;

function isFolder(entry: BrowserFile | BrowserFolder): entry is BrowserFolder {
	return typeof (entry as BrowserFolder).size === "number";
}

const FileEntry: Component<{ name: string; file: BrowserFile }> = ({
	name,
	file,
}) => {
	return (
		<div class="file-label" onClick={[console.log, file]}>
			<FileIcon />
			<span>{name}</span>
		</div>
	);
};

const FolderEntry: Component<{
	folder: BrowserFolder;
	name: string;
	index: number;
}> = ({ folder, name, index }) => {
	const [isOpen, setIsOpen] = createSignal(index < 1);

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

const FileList: Component<{ folder: BrowserFolder }> = ({ folder }) => {
	return (
		<ul class="file-list">
			<Index each={[...folder.entries()]}>
				{(item, index) => {
					const [name, entry] = item();

					return (
						<li class="file-item">
							{isFolder(entry) ? (
								<FolderEntry
									folder={entry as BrowserFolder}
									name={name}
									index={index}
								/>
							) : (
								<FileEntry name={name} file={entry as BrowserFile} />
							)}
						</li>
					);
				}}
			</Index>
		</ul>
	);
};

export const FileBrowser: Component<{ root: BrowserFolder }> = ({ root }) => {
	return (
		<div class="file-browser">
			<FileList folder={root} />
		</div>
	);
};
