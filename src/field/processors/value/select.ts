// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { PLACEHOLDERS } from "../../../const";

export function processSelectValue<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	// const { setup } = props;
	const { event, manualUpdate, preprocessValue, $next } = processor;
	const el = event?.target as HTMLSelectElement;
	const value = !manualUpdate ? el?.value : processor.value;
	if (!preprocessValue) {
		return value;
	}

	//
	let result: any = null;
	const element = $next.element;
	const multiple = element.multiple ?? false;
	if (!multiple) {
		// const prev_value = next.values[key] as string;
		if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
			result = value;
		}
	} else {
		// const prev_value = next.values[key] as string[];
		result = [];
		const options = el != null && el?.options;
		if (options) {
			for (let i = 0, iLen = options.length; i < iLen; i++) {
				const opt = options[i];

				if (opt.selected) {
					let value = opt.value;
					if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
						value = opt.text;
						result.push(value);
					}
				}
			}
		}
	}
	return result;
}
