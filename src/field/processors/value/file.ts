import type { Field, Form, FunctionProps } from "../../../_model";
import { populateFileReader } from "../../../methods/populate-file-reader";

export function processFileValue<S extends Field.Setup<"file">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { store } = props;
	const { event, manualUpdate, preprocessValue, $next } = processor;
	const el = event?.target as HTMLInputElement;
	let result = undefined as
		| undefined
		| FileList
		| string
		| string[]
		| { name: string; url: string }
		| { name: string; url: string }[];
	// first check for manual updates as they're usually different in nature
	if (manualUpdate) {
		result = processor.value;
		const isFileListArr = Array.isArray(result) && result.length > 0 && result[0] instanceof File;
		// if not a filelist array, process value and return null
		if (!isFileListArr && result != null) {
			// const fallback = [] as {name: string;url: string;}[]
			result = (!Array.isArray(result) ? [result] : result) as any[];
			for (let i = 0; i < result.length; i++) {
				const obj = result[i];
				if (typeof obj === "string") {
					// we got a case of fallback placeholder
					result[i] = { name: "unknown file name", url: obj };
				}
				// otherwise, the object is already of type {name,url}
			}

			// update extras
			$next.extras = {
				fallback: result,
				count: { upload: 0, failed: 0, done: 0 },
				files: [],
			} as any;
			return null;
		}
	} else {
		// console.log("result filelist ");
		result = el?.files as FileList;
	}

	result = result as FileList;
	if (preprocessValue) {
		if (result == null || result.length <= 0) {
			// cleanup
			$next.extras = undefined;
		} else {
			// we got files, reset extras and move on
			$next.extras = {
				count: {
					upload: (result as FileList).length,
					failed: 0,
					done: 0,
				},
				files: [],
			} as any;
			for (const file of result) {
				if (!(file instanceof File)) {
					console.warn("qform: upload wasn't of type file ", file, " skipping!!");
					if ($next.extras) {
						$next.extras.count.failed++;
					}
					continue;
				}
				const idx =
					// @ts-expect-error
					$next.extras.files.push({
						file,
						name: file.name,
						stage: "start",
						loading: true,
						progress: {
							loadedBytes: 0,
							totalBytes: file.size,
							percentage: 0,
						},
					}) - 1;

				// for async updates
				populateFileReader(file, {
					onprogress(progress) {
						if ($next.extras == null) {
							return;
						}
						// console.log("progress :: ", progress);
						const file = $next.extras.files[idx];
						file.progress.loadedBytes = progress.loaded;
						file.progress.percentage = progress.percentage;
						$next.extras.files[idx] = file;
						store.set({
							...$next,
							__internal: {
								...$next.__internal,
								update: "extras",
							},
						});
					},
					onloadend: ({ status, buffer, error, progress }) => {
						if ($next.extras == null) {
							return;
						}
						// console.log("loadend :: ", extras);
						const file = $next.extras.files[idx];
						file.progress.loadedBytes = progress.loaded;
						file.progress.percentage = progress.percentage;
						if (status === "success") {
							file.buffer = buffer;
							file.url = typeof buffer === "string" ? buffer : (buffer as any)[0];
							file.stage = "success";
							$next.extras.count.done++;
						} else if (status === "error") {
							file.error = error;
							file.stage = "fail";
							$next.extras.count.failed++;
						} else {
							file.stage = "abort";
							$next.extras.count.failed++;
						}

						// updates
						store.set({
							...$next,
							__internal: {
								...$next.__internal,
								update: "extras",
							},
						});
					},
				});
			}
		}
	} else {
		// value has been updated manually, check extras validity
		if (result != null && result.length > 0) {
			if ($next.extras != null) {
				const files = [] as any[];
				$next.extras.count.done = result.length;
				$next.extras.count.failed = 0;
				for (let i = 0; i < result.length; i++) {
					const extrasFile = $next.extras.files[i];
					const valueFile = result[i];
					if (extrasFile.name !== valueFile.name) {
						$next.extras.count.failed++;
						continue;
					}
					$next.extras.count.done++;
					files.push(extrasFile);
				}
				$next.extras.files = files;
			}
		}
	}

	if ($next.element.multiple) {
		return result;
	}

	return result?.[0];
}
