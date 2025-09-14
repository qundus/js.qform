import type { Field } from "../_model";
import { isFieldIncomplete } from "./checks/is-field-incomplete";

export function fieldCondition<F extends Field.Options>(key: string, field: F) {
	const condition = {
		valid: true,
		hidden: field.hidden === true,
		value: {
			updated: false,
			error: false,
			lastUpdate: false,
		},
		element: {
			state: false,
			visited: false,
			required: field?.required ?? true,
			disabled: field?.disabled ?? false,
		},
	} as Field.Condition;
	if (!condition.hidden) {
		const incomplete = isFieldIncomplete(field, condition, field.value);
		if (incomplete) {
			condition.valid = false;
			// console.log("cc :: ", key, " :: ", JSON.stringify(condition));
			// condition.value.error = "incomplete"; // TODO: make this an config option
		}
	}

	return condition;
}
