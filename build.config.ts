import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	failOnWarn: false,
	declaration: true,
	clean: true,
	entries: [
		{
			builder: "mkdist",
			input: "./src",
			declaration: true,
			outDir: "./dist",
			cleanDist: true,
			// srcDir: "./src",
			// pattern: ["**/index.ts", "**/_types.ts"],
			// addRelativeDeclarationExtensions: false,
		},
	],
	rollup: {
		output: {
			compact: true,
		},
		esbuild: {
			minify: true,
			treeShaking: true,
			keepNames: true,
		},
		dts: {
			compilerOptions: {
				// types: ["unocss", "unocss/vite"],
				noUnusedLocals: false,
				noUnusedParameters: false,
				allowUnusedLabels: true,
				declaration: true,
			},
		},
	},
});
