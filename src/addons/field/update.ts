import type { Field, Form, FunctionProps } from "../../_model";
import { mergeFieldConditions } from "../../methods/merge-field-conditions";

export type FieldAddonUpdate<S extends Field.Setup, O extends Form.Options> = {
	value: (
		value: S["value"] | undefined | ((prev: S["value"] | undefined) => S["value"] | undefined),
		configs?: { preprocess?: boolean },
	) => void;
	condition: (
		value:
			| Partial<Field.Condition>
			| ((prev: Partial<Field.Condition>) => Partial<Field.Condition>),
	) => void;
};
export function fieldUpdateAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonUpdate<S, O> {
	const { key, setup, options, store } = props;
	return {
		value: (_value, configs) => {
			const state = { ...store.get() };
			const prev = state.value; //as S["value"];
			// @ts-expect-error
			const value = typeof _value === "function" ? _value(prev) : _value;
			store.set({
				...state,
				value,
				__internal: {
					update: "value",
					manual: true,
					preprocess: configs?.preprocess,
					event: undefined,
				},
			});
		},
		condition: (value) => {
			const state = { ...store.get() };
			const prev = state.condition;
			const userCondition = typeof value === "function" ? value(prev) : value;
			const condition = mergeFieldConditions(prev, userCondition);
			store.set({
				...state,
				condition,
				__internal: {
					update: "value",
					manual: true,
					// preprocess: configs?.preprocess,
					event: undefined,
				},
			});
		},
	};
}
