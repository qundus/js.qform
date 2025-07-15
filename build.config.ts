import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	failOnWarn: false,
	declaration: true,
	clean: true,
	externals: ["zod", "solid-js"],
	entries: [
		{
			builder: "mkdist",
			input: "./src",
			declaration: true,
			outDir: "./dist",
			cleanDist: true,
			// addRelativeDeclarationExtensions: false,
			// pattern: ["**/index.ts", "**/_types.ts"],
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
				// types: ["solid-js", "astro", "nanostores", "zod", "@qundus/qstate"],
				noUnusedLocals: false,
				noUnusedParameters: false,
				allowUnusedLabels: true,
				declaration: true,
			},
		},
	},
});
