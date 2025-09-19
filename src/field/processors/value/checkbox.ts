import type { Field, Form, FunctionProps } from "../../../_model";

export function processCheckboxValue<S extends Field.Setup, O extends Form.Options>(
	_props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	// const { setup } = props;
	const { event, manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLInputElement;
	const value = !manualUpdate ? el?.value : processor.value;
	if (!preprocessValue) {
		return value;
	}

	//
	let result = value;
	const checked = !manualUpdate ? el?.checked : true;
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
}
