import type { BrowserFolder } from "#/dev/FileBrowser.tsx";

export async function fetchBrowserData(dir: string): Promise<BrowserFolder> {
	const indexRef: string[] = await (await fetch(`/api/${dir}`)).json();

	const scenes = indexRef.reduce((root, entry) => {
		const [name] = entry.substring(1).split("/");
		root.set(name, { path: name, isActive: false });

		return root;
	}, new Map() as BrowserFolder);

	return new Map([[dir, scenes]]);
}
