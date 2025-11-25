import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	server: {
		host: "localhost",
		port: 3080,
		hmr: false,
	},
	build: { target: "esnext" },
	plugins: [solidPlugin()],
	resolve: {
		alias: {
			"#/": fileURLToPath(new URL("./", import.meta.url)),
		},
	},
});
