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
	// crucial checkup
	const multiple = $next.element.multiple ?? false;
	const select = ($next.element.select ?? {}) as Field.SelectSetupOut<S>;
	const _value = !manualUpdate ? $next.value : processor.value;
	const selected = Array.isArray(_value) ? _value : _value == null ? [] : [_value];
	let result = [] as any[];
	//
	select.valueKey = select.valueKey ?? "value";
	select.labelKey = select.labelKey ?? "label";
	select.prev = [];
	select.current = [];

	// check validity of result
	selected.forEach((option, index, arr) => {
		if (option == null) {
			option = { label: "unknown", value: "unknown" } as any;
		} else if (typeof option === "string" || typeof option === "number") {
			option = { label: option, value: option } as any;
		}
		delete option.__selected;
		delete option.__key;
		arr[index] = option;
	});
	if (select.options && select.options.length > 0) {
		if (!Array.isArray(select.options)) {
			throw new Error("qform: only arrays are allowed as selections of fields!");
		}
		for (let i = 0; i < select.options.length; i++) {
			let option = select.options[i];
			// process options
			if (option == null) {
				option = { label: "unknown", value: "unknown", __selected: false } as any;
			} else if (typeof option === "string" || typeof option === "number") {
				option = { label: option, value: option, __selected: false } as any;
			}
			//
			if (option.__selected) {
				select.prev.push(i);
			}
			//
			const item = selected.find((item) => item[select.valueKey] === option[select.valueKey]);
			option.__selected = item != null;
			if (option.__selected) {
				select.current.push(i);
				result.push(option);
			}
			// confirm key
			option.__key = `${$next.__internal.key}-option${i}`;
			select.options[i] = option;
		}
		$next.element.select = select as any;
	}

	if (result.length <= 0) {
		result = undefined as any;
	}
	// console.log("result :: ", result);

	// user wants this value to be there
	if (!preprocessValue) {
		// TODO: lookup user value update in the selections array
		return multiple ? result : result?.[0];
	}
	return multiple ? result : result?.[0];

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
