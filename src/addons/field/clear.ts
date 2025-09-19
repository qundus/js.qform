import type { Field, Form, FunctionProps } from "../../_model";

export type FieldAddonClear<_S extends Field.Setup, _O extends Form.Options> = {
	value: () => void;
};
export function fieldClearAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonClear<S, O> {
	const { key, setup, options, store } = props;
	return {
		value: () => {
			const state = { ...store.get() };
			store.set({
				...state,
				value: undefined,
				__internal: {
					update: "value",
					manual: true,
					preprocess: true,
					event: undefined,
				},
			});
		},
	};
}
