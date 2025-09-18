import type { Field, Form, FunctionProps } from "../../../_model";

export function processCheckboxValue<F extends Field.Setup, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
) {
	// setup
	const { setup: field } = basic;
	const { event } = interaction;
	const { manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLInputElement;
	const value = !manualUpdate ? el?.value : interaction.value;
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
