import type { Extras, Field, Form, FunctionProps } from "../../_model";
import { FIELD } from "../../const";
import { prepareInit } from "../../field/preparations/init";

export type FieldAddonReset<_S extends Field.Setup, _O extends Form.Options> = {
	/** reset field to setup.value, use configs.clear to force clearing = undefined */
	value: (configs?: { clear?: boolean }) => void;
	tel: (configs?: { clear?: boolean; keepCountry?: boolean }) => void;
	/** reset all data to field start setup */
	origin: () => void;
	/**
	 * simple method to
	 * @returns
	 */
	// cycle: () => void;
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
			next.event.DOM = FIELD.DOM.IDLE;
			next.event.MUTATE = FIELD.MUTATE.__RESET;
			store.set(next);
		},
		value: (configs) => {
			const next = { ...store.get() };
			next.value = configs?.clear ? undefined : setup.value;
			next.__internal.manual = true;
			next.__internal.preprocess = true;
			next.event.ev = undefined;
			//
			next.event.DOM = FIELD.DOM.IDLE;
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			store.set(next);
		},
		tel: (configs) => {
			const next = { ...store.get() };
			const extras = next.extras as Extras.Tel.Out<Field.Setup<"tel">>;
			const vv = configs?.clear ? undefined : setup.value;
			let country = null as null | string;
			if (configs?.keepCountry && extras.international.country) {
				country = `${extras.international.prefix ?? "+"}${extras.international.country.dial_code_no_id}`;
			}

			if (vv == null && country == null) {
				next.value = null;
			} else {
				next.value = `${country ?? ""}${vv ?? ""}`;
			}

			next.__internal.manual = true;
			next.__internal.preprocess = true;
			next.event.ev = undefined;
			//
			next.event.DOM = FIELD.DOM.IDLE;
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			store.set(next);
		},
	};
}
