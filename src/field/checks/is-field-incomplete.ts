import type { Field } from "../../_model";
export function isFieldIncomplete<T extends Field.Type, S extends Field.Setup<T>>(
	// element: Field.Element<S>,
	value: any,
	state: Field.StoreObject<S>,
) {
	let result = false;
	const element = state.element;
	const extras = state.extras;
	const isDateType = extras != null && "YEAR" in extras;
	// because no point otherwise, and ofcourse we don't calculate when disabled
	if (!element.hidden && !element.disabled && element.required) {
		if (
			//
			// (field.type === "checkbox" && value === "") ||
			value === "" ||
			(!element.valueNullable && (typeof value === "undefined" || value == null)) ||
			(element.mandatory && (value == null || !value)) // for mandatory checkboxes
		) {
			result = true;
		}
		//
		// console.log("wow :: ", extras?.selected?.validCount);
		// as a bare minimum special incomplete check
		if (isDateType && extras?.selected?.validCount <= 0) {
			result = true;
		}
	}
	return result;
}
