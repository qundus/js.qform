import type { Field } from "../../_model";
export function isFieldIncomplete<T extends Field.Type, S extends Field.Setup<T>>(
	element: Field.Element<S>,
	value: any,
) {
	let result = false;
	// because no point otherwise, and ofcourse we don't calculate when disabled
	if (!element.hidden && !element.disabled && element.required) {
		if (
			//
			// (field.type === "checkbox" && value === "") ||
			value === "" ||
			(!element.valueNullable && (typeof value === "undefined" || value == null)) ||
			(element.checkbox?.mandatory && (value == null || !value)) // for mandatory checkboxes
		) {
			result = true;
		}
	}
	return result;
}
