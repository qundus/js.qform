export function populateFileReader(
	file: File,
	props: {
		onload: (file: string | ArrayBuffer | null | undefined) => void;
	},
) {
	const reader = new FileReader();

	reader.onload = (e) => {
		props.onload(e.target?.result);
	};
	reader.readAsDataURL(file);
}
