import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import middleware from "#/engine/dev/server/middleware.ts";

export const host = "localhost";
export const port = 3080;
export const root = fileURLToPath(new URL("./", import.meta.url));

function devTools(): Plugin {
	return {
		name: "dev-tools",
		configureServer(server) {
			server.middlewares.use("/api", middleware);
		},
	};
}

export default defineConfig({
	server: { host, port, hmr: false },
	build: { target: "esnext" },
	plugins: [solidPlugin(), devTools()],
	resolve: {
		alias: {
			"#/": root,
		},
	},
});
