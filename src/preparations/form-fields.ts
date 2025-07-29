import type { Basics, Fields, FormObject, Options } from "../_model";

import prepareField from "../preparations/field";
import prepareFieldCondition from "../preparations/field-condition";

export default function prepareFormFields<
	B extends Basics,
	F extends Fields<B>,
	O extends Options<F>,
>(props: { basics: B; options: O }) {
	const { basics, options } = props;
	const fields = {} as F;
	const form_init = {
		values: {},
		conditions: {},
		errors: null,
		extras: {},
		incomplete: [],
		// focused: false,
		status: "valid",
	} as FormObject<F>;
	for (const key in basics) {
		const basic = basics[key];
		const field = prepareField({ key, basic, options });
		const condition = prepareFieldCondition({ key, field });
		// @ts-ignore
		fields[key] = field;
		form_init.values[key] = field.value as any;
		form_init.conditions[key] = condition;
		// if (!condition.element.disabled && condition.element.required) {}
		if (!condition.valid) {
			form_init.status = "idle";
		}
	}

	return { fields, form_init };
}
