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
	if (!condition.hidden) {
		const incomplete = isFieldIncomplete(setup, condition, setup.value);
		if (incomplete) {
			condition.valid = false;
			// console.log("cc :: ", key, " :: ", JSON.stringify(condition));
			// condition.value.error = "incomplete"; // TODO: make this an config option
		}
	}

	return condition;
}
