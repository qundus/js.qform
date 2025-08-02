export function getFileString(
	file: File,
	onReady: (file: string | ArrayBuffer | null | undefined) => void,
) {
	const reader = new FileReader();

	reader.onload = (e) => {
		onReady(e.target?.result);
	};
	reader.readAsDataURL(file);
}
