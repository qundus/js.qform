// import { execSync } from "node:child_process";
// import { readdirSync, statSync } from "node:fs";
// import { join } from "node:path";
import { defineConfig } from "tsup";

// const getFolderSize = (folderPath: string) => {
// 	const files = readdirSync(folderPath);
// 	return files.reduce((size, file) => {
// 		return size + statSync(join(folderPath, file)).size;
// 	}, 0);
// };

// publish --access=public --no-git-checks
export default defineConfig((options) => {
	return {
		entry: ["src/index.ts", "src/converters/index.ts", "src/validators/index.ts"],
		external: ["@qundus/qstate"],
		format: ["esm", "cjs"],
		outDir: "./dist",
		clean: true, // Clean dist folder
		// splitting: true,
		sourcemap: true, // Optional: for debugging
		minify: options.watch ? false : "terser",
		treeshake: "recommended",
		dts: true, // Generate .d.ts type files
		// target: "es2017", // better to configure it in tsconfig
		outExtension({ format }) {
			return {
				js: format === "esm" ? ".mjs" : ".cjs",
				dts: ".d.ts",
			};
		},
		// onSuccess: async () => {
		// 	const distPath = join(process.cwd(), "dist");
		// 	const sizeBytes = getFolderSize(distPath);
		// 	const sizeKB = (sizeBytes / 1024).toFixed(2);
		// 	console.log(`\n📦 dist folder size: ${sizeKB} KB`);
		// },
	};
});
