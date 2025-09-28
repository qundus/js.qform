import type { Field, Form, FunctionProps } from "../../_model";
import { DOM, MUTATE } from "../../const";

export type FieldAddonClear<_S extends Field.Setup, _O extends Form.Options> = {
	value: () => void;
};
export function fieldClearAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonClear<S, O> {
	const { store } = props;
	return {
		value: () => {
			const next = { ...store.get() };
			next.value = undefined;
			next.__internal.manual = true;
			next.__internal.preprocess = true;
			next.event.ev = undefined;
			//
			next.event.DOM = DOM.IDLE;
			next.event.MUTATE = MUTATE.VALUE;
			store.set(next);
		},
	};
}
