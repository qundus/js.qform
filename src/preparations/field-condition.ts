import type { Field, FieldCondition } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";

export default function prepareFieldCondition<F extends Field>(props: { key: string; field: F }) {
	const { field } = props;
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
	} as FieldCondition;
	if (!condition.hidden) {
		const incomplete = isFieldIncomplete({ field, value: field.value, condition });
		if (incomplete) {
			condition.valid = false;
			// console.log("cc :: ", key, " :: ", JSON.stringify(condition));
			// condition.value.error = "incomplete"; // TODO: make this an config option
		}
	}

	return condition;
}
