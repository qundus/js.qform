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
	const optionValue = $next.__internal.optionValue;

	// first check validity extras
	if ($next.extras == null) {
		if (setup.selections != null && !Array.isArray(setup.selections)) {
			throw new Error("qform: only arrays are aloowed as selections of fields!");
		}
		$next.extras = {
			selections: setup.selections,
			showList: $next.element.focused,
			valueKey: setup.selectionsValueKey ?? "value",
			labelKey: setup.selectionsLabelKey ?? "label",
		} as any;
	}

	// second check validity of selections
	const valueKey = $next.extras?.valueKey ?? "value";
	const labelKey = $next.extras?.labelKey ?? "label";
	const multiple = $next.element.multiple ?? false;
	const value = !manualUpdate ? $next.value : processor.value;
	const result = [] as any[];
	if (value != null) {
	}
	if ($next.extras?.selections && $next.extras?.selections.length > 0) {
		if ($next.extras?.selections != null && !Array.isArray($next.extras?.selections)) {
			throw new Error("qform: only arrays are allowed as selections of fields!");
		}
		for (let i = 0; i < $next.extras?.selections.length; i++) {
			let option = $next.extras?.selections[i];
			if (option == null) {
				option = { label: "unknown", value: "unknown", selected: false } as any;
			} else if (typeof option === "object") {
				if (!("selected" in option)) {
					// @ts-expect-error
					option.selected = false as any;
				}
			} else if (typeof option === "string") {
				option = { label: option, value: option, selected: false } as any;
			}
			//
			if (option[valueKey] === optionValue[valueKey]) {
				// @ts-expect-error
				option.selected = true;
				result.push(option[valueKey]);
			}
			$next.extras.selections[i] = option;
		}
	}

	// user wants this value to be there
	if (!preprocessValue) {
		// TODO: lookup user value update in the selections array
		return value;
	}

	if (manualUpdate) {
	}

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
	return result;
}
