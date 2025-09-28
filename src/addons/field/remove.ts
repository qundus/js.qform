import type { Field, Form, FunctionProps } from "../../_model";
import { DOM, MUTATE } from "../../const";

export type FieldAddonRemove<_S extends Field.Setup, _O extends Form.Options> = {
	option: (option: any) => void;
	optionByIndex: (index: number) => void;
};
export function fieldRemoveAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonRemove<S, O> {
	const { setup, store } = props;
	return {
		option: (option) => {
			const next = { ...store.get() };
			const valueKey = next.element.select.valueKey;
			let value = next.value as any | any[];
			if (next.element.multiple) {
				if (Array.isArray(value)) {
					value = value.filter((item) => item[valueKey] !== option[valueKey]);
					if (value.length <= 0) {
						value = undefined;
					}
				} else {
					value = undefined;
				}
			} else {
				value = undefined;
			}
			next.value = value;
			next.__internal.manual = true;
			next.__internal.preprocess = true;
			next.event.ev = undefined;
			//
			next.event.DOM = DOM.IDLE;
			next.event.MUTATE = MUTATE.ELEMENT;
			store.set(next);
		},
		optionByIndex: (index) => {
			const state = { ...store.get() };
			let value = state.value as any | any[];
			if (state.element.multiple) {
				if (Array.isArray(value)) {
					value = value.filter((_item, idx) => idx !== index);
					if (value.length <= 0) {
						value = undefined;
					}
				} else {
					value = undefined;
				}
			} else {
				value = undefined;
			}
			state.value = value;
			state.__internal.manual = true;
			state.__internal.preprocess = true;
			state.event.ev = undefined;
			store.set(state);
		},
	};
}
