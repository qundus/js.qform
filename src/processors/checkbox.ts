import type { CreateProcessorProps, Field } from "../_model";

export default function createCheckboxProcessor<F extends Field, Returns>(
	_props: CreateProcessorProps<F>,
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
