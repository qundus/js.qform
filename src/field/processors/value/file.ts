import type { Field, Form, FunctionProps } from "../../../_model";
import { populateFileReader } from "../../../methods/populate-file-reader";

export function processFileValue<F extends Field.Setup, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
	form: Form.StoreObject<any>,
) {
	// setup
	const { key, setup: field, $store } = basic;
	const { event } = interaction;
	const { manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLInputElement;
	let extras = form.extras[key] as Field.Extras<F, "file">;
	let result = undefined as
		| undefined
		| FileList
		| string
		| string[]
		| { name: string; url: string }
		| { name: string; url: string }[];
	// first check for manual updates as they're usually different in nature
	if (manualUpdate) {
		result = interaction.value;
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
			extras = {
				fallback: result as any,
				count: { upload: 0, failed: 0, done: 0 },
				files: [],
			};
			$store.setKey(`extras[${key}]`, extras);
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
			extras = undefined;
		} else {
			// we got files, reset extras and move on
			extras = {
				count: {
					upload: (result as FileList).length,
					failed: 0,
					done: 0,
				},
				files: [],
			};
			for (const file of result) {
				if (!(file instanceof File)) {
					console.warn("qform: upload wasn't of type file ", file, " skipping!!");
					extras.count.failed++;
					continue;
				}
				const idx =
					extras.files.push({
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
						if (extras == null) {
							return;
						}
						// console.log("progress :: ", progress);
						const file = extras?.files[idx];
						file.progress.loadedBytes = progress.loaded;
						file.progress.percentage = progress.percentage;
						extras.files[idx] = file;
						$store.setKey(`extras[${key}]`, { ...extras });
					},
					onloadend: ({ status, buffer, error, progress }) => {
						if (extras == null) {
							return;
						}
						// console.log("loadend :: ", extras);
						const file = extras.files[idx];
						file.progress.loadedBytes = progress.loaded;
						file.progress.percentage = progress.percentage;
						if (status === "success") {
							file.buffer = buffer;
							file.url = typeof buffer === "string" ? buffer : (buffer as any)[0];
							file.stage = "success";
							extras.count.done++;
						} else if (status === "error") {
							file.error = error;
							file.stage = "fail";
							extras.count.failed++;
						} else {
							file.stage = "abort";
							extras.count.failed++;
						}

						// updates
						$store.setKey(`extras[${key}]`, { ...extras });
					},
				});
			}
		}
	} else {
		// value has been updated manually, check extras validity
		if (result != null && result.length > 0) {
			if (extras != null) {
				const files = [] as any[];
				extras.count.done = result.length;
				extras.count.failed = 0;
				for (let i = 0; i < result.length; i++) {
					const extrasFile = extras.files[i];
					const valueFile = result[i];
					if (extrasFile.name !== valueFile.name) {
						extras.count.failed++;
						continue;
					}
					extras.count.done++;
					files.push(extrasFile);
				}
				extras.files = files;
			}
		}
	}

	// for sync update
	$store.setKey(`extras[${key}]`, extras);
	return result;
}
