import type { Extras, Field, Form, FunctionProps } from "../../../_model";
import { DOM, MUTATE } from "../../../const";
import { populateFileReader } from "../../../methods/populate-file-reader";

export function processFileValue<S extends Field.Setup<"file">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { store } = props;
	const { el, manualUpdate, preprocessValue, $next } = processor;
	const extras = {
		count: { upload: 0, failed: 0, done: 0 },
		fallback: undefined,
		files: undefined as unknown as any[],
	}; //as Extras.FileOut<S>;
	let _value = undefined as
		| undefined
		| FileList
		| string
		| string[]
		| { name: string; url: string }
		| { name: string; url: string }[];

	// first check for manual updates as they're usually different in nature
	if (manualUpdate) {
		_value = processor.value;
		const isFileListArr = Array.isArray(_value) && _value.length > 0 && _value[0] instanceof File;
		// if not a filelist array, process value and return null
		if (!isFileListArr && _value != null) {
			// const fallback = [] as {name: string;url: string;}[]
			_value = (!Array.isArray(_value) ? [_value] : _value) as any[];
			for (let i = 0; i < _value.length; i++) {
				const obj = _value[i];
				if (typeof obj === "string") {
					// we got a case of fallback placeholder
					_value[i] = { name: "unknown file name", url: obj };
				}
				// otherwise, the object is already of type {name,url}
			}
			// @ts-expect-error
			extras.fallback = _value;
			$next.extras = extras as any;
			return null;
		}
	} else {
		// console.log("result filelist");
		_value = el?.files as FileList;
	}

	if (_value == null) {
		$next.extras = extras as any;
		return null;
	}

	//
	const result = _value as FileList;
	// it doesn't make sense to have a different behavior for !preprocessValue
	// if it does exactly what a normal file upload does, cancelling preprocess
	// value here
	// if (!preprocessValue) {
	// 	extras.count = {
	// 		upload: result.length,
	// 		failed: 0,
	// 		done: 0,
	// 	};
	// 	extras.files = [];
	// 	// value has been updated manually, update extras accordingly
	// 	if (result != null && result.length > 0) {
	// 		for (let i = 0; i < result.length; i++) {
	// 			const extrasFile = $next.extras.files?.[i];
	// 			const valueFile = result[i];
	// 			if (extrasFile?.name !== valueFile.name) {
	// 				extras.count.failed++;
	// 				continue;
	// 			}
	// 			extras.count.done++;
	// 			extras.files.push(extrasFile);
	// 		}
	// 	}
	// 	return $next.element.multiple ? result : result?.[0];
	// }

	// we got files, reset extras and move on
	extras.count = {
		upload: result.length,
		failed: 0,
		done: 0,
	};
	extras.files = [];
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
				// console.log("progress :: ", progress);
				const file = extras.files[idx];
				const next = { ...store.get() };
				file.progress.loadedBytes = progress.loaded;
				file.progress.percentage = progress.percentage;
				//
				if (next.extras == null) {
					next.extras = extras as any;
				}
				if (next.extras.files == null) {
					next.extras.files = [file];
				}
				next.extras.files[idx] = file;
				next.__internal.manual = false;
				next.event.DOM = DOM.FILE_PROGRESS;
				next.event.MUTATE = MUTATE.__EXTRAS;

				console.log("update progress :: ");
				store.set(next);
			},
			onloadend: ({ status, buffer, error, progress }) => {
				// console.log("loadend :: ", extras);
				const file = extras.files[idx];
				const next = { ...store.get() };
				file.progress.loadedBytes = progress.loaded;
				file.progress.percentage = progress.percentage;
				//
				if (status === "success") {
					file.buffer = buffer;
					file.url = typeof buffer === "string" ? buffer : (buffer as any)[0];
					file.stage = "success";
					next.extras.count.done++;
				} else if (status === "error") {
					file.error = error;
					file.stage = "fail";
					next.extras.count.failed++;
				} else {
					file.stage = "abort";
					next.extras.count.failed++;
				}

				// updates
				if (next.extras == null) {
					next.extras = extras as any;
				}
				if (next.extras.files == null) {
					next.extras.files = [file];
				}
				next.extras.files[idx] = file;
				next.__internal.manual = false;
				next.event.DOM = DOM.FILE_DONE;
				next.event.MUTATE = MUTATE.__EXTRAS;
				store.set(next);
			},
		});
	}

	return $next.element.multiple ? result : result?.[0];
}
