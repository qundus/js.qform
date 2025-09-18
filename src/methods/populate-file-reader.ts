export function populateFileReader(
	file: File,
	props: {
		// onload: (file:  | null | undefined) => void;
		onloadstart?: () => void;
		onprogress?: (progress: { loaded: number; total: number; percentage: number }) => void;
		onloadend: (result: {
			status: "success" | "error" | "abort";
			progress: {
				loaded: number;
				total: number;
				percentage: number;
			};
			buffer?: string | ArrayBuffer | null;
			error?: DOMException | null;
		}) => void;
	},
) {
	const reader = new FileReader();

	// Track progress values for onloadend
	let lastLoaded = 0;
	let lastTotal = 0;
	let lastPercentage = 0;

	reader.onprogress = (e) => {
		if (e.lengthComputable) {
			lastLoaded = e.loaded;
			lastTotal = e.total;
			lastPercentage = (e.loaded / e.total) * 100;

			if (props.onprogress) {
				props.onprogress({ loaded: e.loaded, total: e.total, percentage: lastPercentage });
			}
		}
	};

	reader.onloadstart = () => {
		if (props.onloadstart) {
			props.onloadstart();
		}
	};

	reader.onloadend = () => {
		if (props.onloadend) {
			let status: "success" | "error" | "abort";

			if (reader.error) {
				status = "error";
			} else if (reader.readyState === FileReader.DONE && !reader.result) {
				status = "abort";
			} else {
				status = "success";
			}

			props.onloadend({
				status,
				buffer: reader.result,
				error: reader.error,
				progress: {
					loaded: lastLoaded,
					total: lastTotal,
					percentage: lastPercentage,
				},
			});
		}
	};

	reader.readAsDataURL(file);
}
