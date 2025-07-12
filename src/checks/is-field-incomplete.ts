import type { Field, FieldCondition, FieldType } from "../_model";

interface Props<T extends FieldType, F extends Field<T>> {
	field: F;
	value: any;
	condition: FieldCondition;
	// options?: Pick<Options<any>, "incompleteAffectsCondition" | "incompleteBehavior">;
}
export default function isFieldIncomplete<T extends FieldType, F extends Field<T>>(
	props: Props<T, F>,
) {
	const { value, condition, field } = props;
	let result = false;
	// because no point otherwise, and ofcourse we don't calculate when disabled
	if (!condition.hidden && !condition.element.disabled && condition.element.required) {
		if (
			//
			// (field.type === "checkbox" && value === "") ||
			value === "" ||
			(!field.valueNullable && (typeof value === "undefined" || value == null)) ||
			(field.mandatory && (value == null || !value)) // for mandatory checkboxes
		) {
			result = true;
		}
	}
	return result;
}
