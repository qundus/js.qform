const ranges = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;
export enum Ranges {
	byte = "Bytes",
	kilo = "KB",
	meg = "MB",
	gig = "GB",
	tera = "TB",
	peta = "PB",
	exa = "EB",
	zetta = "ZB",
	yotta = "YB",
}
export function bytesInfo(bytes: number, decimals = 2) {
	if (!+bytes) return { size: 0, range: "Bytes", range_idx: 0, format: "0 Bytes" };

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;

	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const size = Number.parseFloat((bytes / k ** i).toFixed(dm));
	const range = ranges[i];
	return { size, range, range_idx: i, format: `${size} ${range}` };
}

export function isFileSizeLessThan(
	file: File,
	file_size: number,
	size_range: (typeof ranges)[number],
	decimals = 2,
) {
	if (!file) return undefined;
	const { size, range_idx } = bytesInfo(file.size, decimals);
	const file_range_idx = ranges.indexOf(size_range);
	if (range_idx === file_range_idx) {
		if (size <= file_size) {
			return true;
		}
	} else if (range_idx < file_range_idx) {
		return true;
	}

	return false;
	// return `File size limit is ${file_size} ${size_range}`;
}
