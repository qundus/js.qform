import type { Field } from "../_model";

export function mergeFieldConditions(old: Field.Condition, next: Partial<Field.Condition>) {
	return {
		...old,
		...next,
		value: {
			...old.value,
			...next.value,
		},
		element: {
			...old.element,
			...next.element,
		},
	} as Field.Condition;
}
