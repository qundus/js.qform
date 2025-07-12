import type { FieldCondition } from "../_model";

export default function mergeConditions(old: FieldCondition, next: Partial<FieldCondition>) {
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
	} as FieldCondition;
}
