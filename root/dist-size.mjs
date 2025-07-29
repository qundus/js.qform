import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const getFolderSize = (folderPath) => {
	const files = readdirSync(folderPath);
	return files.reduce((size, file) => {
		return size + statSync(join(folderPath, file)).size;
	}, 0);
};

async function onSuccess() {
	const distPath = join(process.cwd(), "dist");
	const sizeBytes = getFolderSize(distPath);
	const sizeKB = (sizeBytes / 1024).toFixed(2);
	console.log(`\n📦 dist folder size: ${sizeKB} KB`);
}

onSuccess();
