import type { Field, Form, FunctionProps } from "../../../_model";
import { populateFileReader } from "../../../methods/populate-file-reader";

export function processFileValue<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
) {
	// setup
	const { key, field, $store } = basic;
	const { event } = interaction;
	const { manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLInputElement;
	const value = !manualUpdate ? (el?.files as FileList) : interaction.value;
	if (!preprocessValue) {
		return value;
	}

	//
	const result = value;
	let in_progress_files = 0;
	let ready_files = 0;
	const all_extras = [] as Field.Extras<"file">;
	for (const file of value) {
		// if ($state == null) {
		// 	console.error("form(internal): state wasn't passed down, aborting file extras!");
		// 	break;
		// }

		in_progress_files++;
		if (!(file instanceof File)) {
			continue;
		}
		populateFileReader(file, {
			onload: (buffer) => {
				const extras = {
					buffer,
					placeholder: typeof buffer === "string" ? buffer : (buffer as any)[0],
					file,
					name: file.name,
				};
				all_extras.push(extras);
				ready_files++;

				if (ready_files === in_progress_files) {
					// $form.extras[key] = all_extras;
					$store.update(({ $next }) => {
						$next.extras[key] = all_extras;
						return $next;
					});
				}
			},
		});
	}
	return result;
}
