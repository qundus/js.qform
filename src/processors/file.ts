import type { CreateProcessorProps, Field, FieldExtras, Options } from "../_model";
import { getFileString } from "../methods/get-file-string";

export default function createFileProcessor<F extends Field, O extends Options<any, any>>(
	props: CreateProcessorProps<F, O>,
) {
	const { key, $form } = props;
	return (value: any) => {
		let in_progress_files = 0;
		let ready_files = 0;
		const all_extras = [] as FieldExtras<"file">;
		for (const file of value) {
			// if ($state == null) {
			// 	console.error("form(internal): state wasn't passed down, aborting file extras!");
			// 	break;
			// }

			in_progress_files++;
			if (!(file instanceof File)) {
				continue;
			}
			getFileString(file, (buffer) => {
				const extras = {
					buffer,
					placeholder: typeof buffer === "string" ? buffer : (buffer as any)[0],
					file,
					name: file.name,
				};
				all_extras.push(extras);
				ready_files++;

				if (ready_files === in_progress_files) {
					$form.extras[key] = all_extras;
					// state.update((next) => {
					// 	next.extras[key] = all_extras;
					// });
				}
			});
		}
		return value;
	};
}
