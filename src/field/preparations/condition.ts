import type { Field } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";

export function prepareCondition<S extends Field.Setup>(key: string, setup: S) {
	const condition = {
		valid: true,
		hidden: setup.hidden === true,
		value: {
			updated: false,
			error: false,
			lastUpdate: false,
		},
		element: {
			state: false,
			visited: false,
			required: setup?.required ?? true,
			disabled: setup?.disabled ?? false,
		},
	} as Field.Condition;
	// check file value
	if (setup.value != null) {
		if (setup.type === "file") {
			if (
				!(
					setup.value instanceof File ||
					(Array.isArray(setup.value) && setup.value.length > 0 && setup.value[0] instanceof File)
				)
			) {
				condition.valid = false;
			}
		}
	}
	//
	if (!condition.hidden) {
		const incomplete = isFieldIncomplete(setup, condition, setup.value);
		if (incomplete) {
			condition.valid = false;
			// condition.value.error = "incomplete"; // TODO: make this an config option
			// console.log("cc :: ", key, " :: ", JSON.stringify(condition));
		}
	}

	return condition;
}
