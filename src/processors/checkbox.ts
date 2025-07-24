import type { CreateProcessorProps, Field, Options } from "../_model";

export default function createCheckboxProcessor<F extends Field, O extends Options<any, any>>(
	_props: CreateProcessorProps<F, O>,
) {
	// const { field } = props;
	return (checked: any, value: any) => {
		let result = value;
		try {
			const c = Boolean(checked);
			if (value == null || value === "on") {
				result = c;
			} else {
				if (c) {
					result = value ?? c;
				} else {
					result = null;
				}
			}
		} catch (e) {
			result = null;
		}
		return result;
	};
}
