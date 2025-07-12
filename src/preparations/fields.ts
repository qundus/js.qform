import { type _STATE, createMap } from ":setup/state";
import type { Basics, Field, Fields, Options, State } from "../_model";

import prepareField from "../preparations/field";
import prepareFieldCondition from "../preparations/field-condition";

export default function prepareFields<B extends Basics, F extends Fields<B> = Fields<B>>(props: {
	basics: B;
	options: Options<F>;
}) {
	const { basics, options } = props;
	const fields = {} as F;
	const state_init = {
		values: {},
		conditions: {},
		errors: null,
		extras: {},
		incomplete: [],
		// focused: false,
		status: "valid",
	} as State<F>["value"];
	for (const key in basics) {
		const basic = basics[key];
		const field = prepareField({ key, basic, options });
		const condition = prepareFieldCondition({ key, field });
		// @ts-ignore
		fields[key] = field;
		state_init.values[key] = field.value as any;
		state_init.conditions[key] = condition;
		// if (!condition.element.disabled && condition.element.required) {}
		if (!condition.valid) {
			state_init.status = "idle";
		}
	}

	return { fields, state_init };
}
