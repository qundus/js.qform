import type { Field, Form, FunctionProps } from "../../_model";

export type FieldAddonClear<_S extends Field.Setup, _O extends Form.Options> = {
	value: () => void;
};
export function fieldClearAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonClear<S, O> {
	const { store } = props;
	return {
		value: () => {
			const state = { ...store.get() };
			state.value = undefined;
			state.__internal.manual = true;
			state.__internal.preprocess = true;
			state.event.ev = undefined;
			store.set(state);
		},
	};
}
