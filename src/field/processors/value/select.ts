// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Extras, Field, Form, FunctionProps } from "../../../_model";
// import { PLACEHOLDERS } from "../../../const";

export function processSelectValue<
	S extends Field.Setup<"select" | "select.radio">,
	O extends Form.Options,
>(props: FunctionProps.Field<S, O>, processor: FunctionProps.FieldProcessor<S, O>) {
	// setup
	const { setup } = props;
	const { manualUpdate, preprocessValue, $next } = processor;
	// crucial checkup
	const multiple = $next.element.multiple ?? false;
	const extras = ($next.extras ?? setup.select ?? {}) as Extras.SelectOut<S>;
	const _value = !manualUpdate ? $next.value : processor.value;
	const result = Array.isArray(_value) ? _value : _value == null ? [] : [_value];
	//
	extras.valueKey = extras.valueKey ?? "value";
	extras.labelKey = extras.labelKey ?? "label";
	extras.prev = [];
	extras.current = [];
	//
	if (extras.options?.length > 0) {
		if (!Array.isArray(extras.options)) {
			throw new Error("qform: only arrays are allowed as selections of fields!");
		}
		for (let i = 0; i < extras.options.length; i++) {
			let option = extras.options[i];
			// process options
			if (option == null) {
				option = { label: "unknown", value: "unknown", __selected: false } as any;
			} else if (typeof option === "string" || typeof option === "number") {
				option = { label: option, value: option, __selected: false } as any;
			}
			//
			if (option.__selected === true) {
				extras.prev.push(i);
			}
			// processings
			option.__key = `${$next.__internal.key}-option${i}`;
			if (!((option.__valueKey ?? extras.valueKey) in option)) {
				if (extras.throwOnKeyNotFound) {
					throw new Error(
						`qform: ${$next.__internal.key}.select.valueKey<${extras.valueKey}>` +
							` does not exist in option ${JSON.stringify(option)}`,
					);
				} else {
					option.__valueKey = "value" in option ? "value" : Object.keys(option)[0];
				}
			}
			if (!((option.__labelKey ?? extras.labelKey) in option)) {
				if (extras.throwOnKeyNotFound) {
					throw new Error(
						`qform: ${$next.__internal.key}.select.labelKey<${extras.labelKey}>` +
							` does not exist in option ${JSON.stringify(option)}`,
					);
				} else {
					option.__labelKey = "label" in option ? "label" : (option.__valueKey ?? extras.valueKey);
				}
			}
			// validation
			const found = result.find((other, idx, arr) => {
				if (other == null) {
					other = { label: "unknown", value: "unknown" } as any;
				} else if (typeof option === "string" || typeof option === "number") {
					other = { label: option, value: option } as any;
				}
				arr[idx] = other;
				return (
					other[other.__valueKey ?? extras.valueKey] ===
					option[option.__valueKey ?? extras.valueKey]
				);
			});
			option.__selected = found != null;
			if (option.__selected === true) {
				extras.current.push(i);
				// result.push(option);
			}
			// confirmation
			extras.options[i] = option;
		}
	} else {
		extras.options = [];
	}

	$next.extras = (extras ?? {}) as any;

	// for that one case of not having options yet value is updated
	if (result.length > 0 && extras.current.length <= 0) {
		return null;
	}

	// user wants this value to be there
	if (!preprocessValue) {
		// TODO: lookup user value update in the selections array
		return result.length <= 0 ? undefined : multiple ? result : result?.[0];
	}
	return result.length <= 0 ? undefined : multiple ? result : result?.[0];

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
