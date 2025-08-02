import type { ProcessorProps, Field, Options } from "../_model";
import { default as checkbox } from "./checkbox";
import { default as file } from "./file";
import { default as number } from "./number";
import { default as select } from "./select";

export default function createProcessors<F extends Field, O extends Options<any>>(
	props: ProcessorProps<F, O>,
) {
	return {
		get checkbox() {
			return checkbox(props);
		},
		get file() {
			return file(props);
		},
		get select() {
			return select(props);
		},
		get number() {
			return number(props);
		},
	};
}
