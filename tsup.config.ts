import path from "path";
import fs from "fs";
import { defineConfig } from "tsup";

// publish --access=public --no-git-checks
export default defineConfig((options) => {
	// Copy locale files to src so they can be imported
	const sourceLocales = path.join("node_modules", "air-datepicker", "locale");
	const destLocales = path.join("src", "externals", "air-datepicker", "locale");

	if (fs.existsSync(sourceLocales) && !fs.existsSync(destLocales)) {
		fs.mkdirSync(destLocales, { recursive: true });
		const files = fs.readdirSync(sourceLocales);
		files.forEach((file) => {
			if (file.endsWith(".js")) {
				fs.copyFileSync(path.join(sourceLocales, file), path.join(destLocales, file));
			}
		});
	}
	return [
		{
			entry: [
				//
				"src/index.ts",
				"src/converters/index.ts",
				"src/validators/index.ts",
				"src/const/index.ts",
				"src/externals/**/*",
			],
			external: [
				"@qundus/qstate",
				"astro",
				"preact",
				"react",
				"react-dom",
				"solid-js",
				"svelte",
				"zod",
				"vue",
				"air-datepicker",
			],
			format: ["esm", "cjs"],
			outDir: "./dist",
			clean: true, // Clean dist folder
			splitting: true,
			sourcemap: true, // Optional: for debugging
			minify: false,
			treeshake: "recommended",
			dts: true, // Generate .d.ts type files
			// target: "es2017", // better to configure it in tsconfig
			outExtension({ format }) {
				return {
					js: format === "esm" ? ".mjs" : ".cjs",
					dts: ".d.ts",
				};
			},
			// terserOptions: {},
			// onSuccess: async () => {
			// 	const distPath = join(process.cwd(), "dist");
			// 	const sizeBytes = getFolderSize(distPath);
			// 	const sizeKB = (sizeBytes / 1024).toFixed(2);
			// 	console.log(`\n📦 dist folder size: ${sizeKB} KB`);
			// },
		},
		// {
		// 	entry: ["node_modules/air-datepicker/locale/*.js"],
		// 	external: ["air-datepicker"],
		// 	format: ["cjs"],
		// 	outDir: "./dist/external",
		// 	clean: true, // Clean dist folder
		// 	splitting: false,
		// 	// sourcemap: true, // Optional: for debugging
		// 	minify: options.watch ? false : "terser",
		// 	treeshake: "recommended",
		// 	bundle: false,
		// 	// noExternal: [],
		// 	dts: false,
		// 	skipNodeModulesBundle: true,
		// 	// loader: {
		// 	// 	".js": "copy",
		// 	// 	".d.ts": "copy",
		// 	// },
		// 	// target: "es2017", // better to configure it in tsconfig
		// 	outExtension({ format }) {
		// 		return {
		// 			js: format === "esm" ? ".mjs" : ".cjs",
		// 			dts: ".d.ts",
		// 		};
		// 	},
		// 	esbuildOptions(options, context) {
		// 		options.outbase = "./node_modules";
		// 	},
		// },
	];
});
