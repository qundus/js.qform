import type { Field, Form, FunctionProps } from "../../_model";
import { DOM, MUTATE } from "../../const";
import { prepareInit } from "../../field/preparations/init";

export type FieldAddonReset<_S extends Field.Setup, _O extends Form.Options> = {
	/** reset field to setup.value, use configs.clear to force clearing = undefined */
	value: (configs?: { clear?: boolean }) => void;
	/** reset all data to field start setup */
	origin: () => void;
};
export function fieldAddonReset<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonReset<S, O> {
	const { key, setup, options, store } = props;
	return {
		origin: () => {
			const next = prepareInit(key, setup, options, store);
			next.__internal.manual = true;
			next.__internal.preprocess = true;
			next.event.ev = undefined;
			//
			next.event.DOM = DOM.IDLE;
			next.event.MUTATE = MUTATE.__RESET;
			store.set(next);
		},
		value: (configs) => {
			const next = { ...store.get() };
			next.value = configs?.clear ? undefined : setup.value;
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
