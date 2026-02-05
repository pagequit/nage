import { readdirSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { root } from "#/vite.config.ts";

function buildBrowserIndex(dir: string): string[] {
	const dirents = readdirSync(dir, {
		withFileTypes: true,
		recursive: true,
	});

	return dirents
		.filter((dirent) => dirent.isFile())
		.map((dirent) => {
			const path = dirent.parentPath.substring(dir.length - 1);

			return `${path}/${dirent.name}`;
		});
}

function getScenes(req: IncomingMessage, res: ServerResponse) {
	const sceneData = buildBrowserIndex(`${root}/game/scenes`);

	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify(sceneData));
}

function get(req: IncomingMessage, res: ServerResponse): void {
	const match = req.url?.match(/^\/(\w+)$/);
	if (!match) {
		console.error(req.url);
		res.statusCode = 400;
		res.end();
		return;
	}

	switch (req.url) {
		case "/scenes": {
			getScenes(req, res);
			break;
		}
	}
}

function post(req: IncomingMessage, res: ServerResponse): void {
	// let body = "";
	// req.on("data", (chunk) => {
	// 	body += chunk.toString();
	// });
	// req.on("end", () => {
	// 	const data: SceneData = JSON.parse(body);
	// 	writeFileSync(
	// 		`${dev.scenesDir}/${data.name}.json`,
	// 		JSON.stringify(data, null, 2),
	// 		"utf8",
	// 	);
	// 	res.statusCode = 204;
	// 	res.end();
	// });
}

export default function (req: IncomingMessage, res: ServerResponse): void {
	switch (req.method) {
		case "GET": {
			get(req, res);
			break;
		}
		case "POST": {
			post(req, res);
			break;
		}
	}
}
