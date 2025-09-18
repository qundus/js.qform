import type { Field, Form, FunctionProps } from "../../../_model";

export function processNumberValue<F extends Field.Setup, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
) {
	// setup
	// const { key, field, $store } = basic;
	const { event } = interaction;
	const { manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLInputElement;
	const value = !manualUpdate ? el?.value : interaction.value;
	if (!preprocessValue) {
		return value;
	}

	//
	let result = null as number | null;
	try {
		result = Number(value);
		if (Number.isNaN(result)) {
			result = value;
		}
	} catch (e) {
		result = value;
	}
	return result;
}
