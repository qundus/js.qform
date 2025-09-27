import type { Field, Form, FunctionProps } from "../../_model";
import { DOM, MUTATE } from "../../const";

export type FieldAddonUpdate<S extends Field.Setup, O extends Form.Options> = {
	value: (
		value: S["value"] | ((prev: undefined) => S["value"] | undefined) | undefined,
		configs?: { preprocess?: boolean },
	) => void;
	condition: (
		value:
			| Partial<Field.Condition>
			| ((prev: Partial<Field.Condition>) => Partial<Field.Condition>),
	) => void;
	element: (
		value:
			| Partial<Field.Element<S>>
			| ((prev?: Partial<Field.Element<S>>) => Partial<Field.Element<S>>),
	) => void;
	props: <G extends S["props"]>(
		value: Partial<G> | ((prev: Partial<G>) => Partial<G> | undefined) | undefined,
	) => void;
	// /**
	//  * special api to update selections extras
	//  */
	// extras: <G extends Field.Extras<S>>(props: Partial<G> | ((value: G) => Partial<G>)) => void;
};
export function fieldUpdateAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonUpdate<S, O> {
	const { store, options, setup } = props;
	return {
		value: (value, configs) => {
			const state = { ...store.get() };
			const prev = state.value; //as S["value"];
			const next = typeof value === "function" ? (value as any)(prev) : value;
			state.value = next;
			state.__internal.manual = true;
			state.__internal.preprocess = configs?.preprocess;
			//
			state.event.MUTATE = MUTATE.VALUE;
			state.event.DOM = DOM.IDLE;
			store.set(state);
		},
		condition: (value) => {
			const state = store.get();
			const prev = state.condition;
			const next = typeof value === "function" ? value(prev) : value;
			state.condition = { ...prev, ...next };
			state.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			//
			state.event.MUTATE = MUTATE.CONDITION;
			state.event.DOM = DOM.IDLE;
			store.set(state);
		},
		element: (value) => {
			const state = store.get();
			const prev = state.element;
			const next = typeof value === "function" ? value(prev) : value;
			state.element = { ...prev, ...next };
			state.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			state.event.MUTATE = MUTATE.ELEMENT;
			state.event.DOM = DOM.IDLE;
			store.set(state);
		},
		props: (value) => {
			const state = store.get();
			const prev = state.props;
			const next = typeof value === "function" ? (value as any)(prev) : value;
			state.props = next;
			state.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			state.event.MUTATE = MUTATE.PROPS;
			state.event.DOM = DOM.IDLE;
			store.set(state);
		},
	};
}
