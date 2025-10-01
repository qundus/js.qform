import type { Field, Form, FunctionProps } from "../../../_model";

export function processNumberValue<S extends Field.Setup, O extends Form.Options>(
	_props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	const { el } = processor;
	const { manualUpdate, preprocessValue } = processor;
	const value = !manualUpdate ? el?.value : processor.value;
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
