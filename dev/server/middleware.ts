import { readdirSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

function buildBrowserIndex(dir: string): string[] {
	const dirents = readdirSync(dir, {
		withFileTypes: true,
		recursive: true,
	});

	return dirents
		.filter((dirent) => dirent.isFile())
		.map((dirent) => {
			const path = dirent.parentPath.substring(dir.length - 2);
			return `${path}/${dirent.name}`;
		});
}

function get(req: IncomingMessage, res: ServerResponse): void {
	console.log(req.url);
	const match = req.url?.match(/\/(\w+)$/);
	if (!match) {
		res.statusCode = 400;
		res.end();
	}

	const sceneData = buildBrowserIndex(`.${req.url}`);

	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify(sceneData));
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
