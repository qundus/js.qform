// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { PLACEHOLDERS } from "../../../const";

export function processSelectValue<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
) {
	// setup
	const { field } = basic;
	const { event } = interaction;
	const { manualUpdate, preprocessValue } = processor;
	const el = event?.target as HTMLSelectElement;
	const value = !manualUpdate ? el?.value : interaction.value;
	if (!preprocessValue) {
		return value;
	}

	//
	let result: any = null;
	const multiple = field.multiple ?? false;
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
