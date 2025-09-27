// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { PLACEHOLDERS } from "../../../const";

export function processSelectValue<
	S extends Field.Setup<"select" | "radio">,
	O extends Form.Options,
>(props: FunctionProps.Field<S, O>, processor: FunctionProps.FieldProcessor<S, O>) {
	// setup
	const { setup } = props;
	const { event, manualUpdate, preprocessValue, $next } = processor;
	const valueKey = $next.element.selectionsValueKey ?? "value";
	// const labelKey = $next.element.selectionsLabelKey ?? "label";
	const multiple = $next.element.multiple ?? false;
	const selections = $next.element.selections as any[];
	const _value = !manualUpdate ? $next.value : processor.value;
	const result = [] as any[];
	if (selections && selections.length > 0) {
		if (!Array.isArray(selections)) {
			throw new Error("qform: only arrays are allowed as selections of fields!");
		}
		const selected = Array.isArray(_value) ? _value : _value == null ? [] : [_value];
		for (let i = 0; i < selections.length; i++) {
			let option = selections[i];
			// process options
			if (option == null) {
				option = { label: "unknown", value: "unknown", __selected: false } as any;
			} else if (typeof option === "string" || typeof option === "number") {
				option = { label: option, value: option, __selected: false } as any;
			}
			if (selected.includes(option[valueKey])) {
				option.__selected = true;
				result.push(option[valueKey]);
			} else {
				option.__selected = false;
			}
			selections[i] = option;
		}
		$next.element.selections = selections;
	}

	// user wants this value to be there
	if (!preprocessValue) {
		// TODO: lookup user value update in the selections array
		return multiple ? result : result[0];
	}
	return multiple ? result : result[0];

	//
	// if (!multiple) {
	// 	// const prev_value = next.values[key] as string;
	// 	if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
	// 		result = value;
	// 	}
	// } else {
	// 	// const prev_value = next.values[key] as string[];
	// 	result = [];
	// 	// const options = el != null && el?.options;
	// 	// if (options) {
	// 	// 	for (let i = 0, iLen = options.length; i < iLen; i++) {
	// 	// 		const opt = options[i];

	// 	// 		if (opt.selected) {
	// 	// 			let value = opt.value;
	// 	// 			if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
	// 	// 				value = opt.text;
	// 	// 				result.push(value);
	// 	// 			}
	// 	// 		}
	// 	// 	}
	// 	// }
	// }
}
