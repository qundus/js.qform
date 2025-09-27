import type { Field, Form, FunctionProps } from "../../_model";

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
			const state = store.get();
			const prev = state.value; //as S["value"];
			const next = typeof value === "function" ? (value as any)(prev) : value;
			store.set({
				...state,
				value: next,
				__internal: {
					update: "value",
					manual: true,
					preprocess: configs?.preprocess,
					event: state.__internal.event,
				},
			});
		},
		condition: (value) => {
			const state = store.get();
			const prev = state.condition;
			const next = typeof value === "function" ? value(prev) : value;
			store.set({
				...state,
				condition: { ...prev, ...next },
				__internal: {
					update: "value",
					manual: true,
					// preprocess: configs?.preprocess,
					event: state.__internal.event,
				},
			});
		},
		element: (value) => {
			const state = store.get();
			const prev = state.element;
			const next = typeof value === "function" ? value(prev) : value;
			store.set({
				...state,
				element: { ...prev, ...next },
				__internal: {
					update: "element",
					manual: true,
					// preprocess: configs?.preprocess,
					event: state.__internal.event,
				},
			});
		},
		props: (value) => {
			const state = store.get();
			const prev = state.props;
			const next = typeof value === "function" ? (value as any)(prev) : value;
			store.set({
				...state,
				props: next,
				__internal: {
					update: "props",
					manual: true,
					// preprocess: configs?.preprocess,
					event: state.__internal.event,
				},
			});
		},
		// extras: (value) => {
		// 	if (setup.type !== "select" && setup.type !== "radio") {
		// 		console.warn(
		// 			"qform: field.update.selection method can only be used when field is of type select or radio",
		// 		);
		// 		return;
		// 	}
		// 	const state = store.get();
		// 	const prev = state.props;
		// 	const next = typeof value === "function" ? (value as any)(prev) : value;
		// 	store.set({
		// 		...state,
		// 		extras: next,
		// 		__internal: {
		// 			update: "extras",
		// 			manual: true,
		// 			// preprocess: configs?.preprocess,
		// 			event: state.__internal.event,
		// 		},
		// 	});
		// },
	};
}
