import type { Field } from "../../_model";
export function isFieldIncomplete<T extends Field.Type, F extends Field.Setup<T>>(
	setup: F,
	condition: Field.Condition,
	value: any,
) {
	let result = false;
	// because no point otherwise, and ofcourse we don't calculate when disabled
	if (!condition.hidden && !condition.element.disabled && condition.element.required) {
		if (
			//
			// (field.type === "checkbox" && value === "") ||
			value === "" ||
			(!setup.valueNullable && (typeof value === "undefined" || value == null)) ||
			(setup.mandatory && (value == null || !value)) // for mandatory checkboxes
		) {
			result = true;
		}
	}
	return result;
}
