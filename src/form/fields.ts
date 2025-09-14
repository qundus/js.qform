import type { Form } from "../_model";
import { fieldOptionsProcessor } from "../field/processors/options-processor";
import { fieldCondition } from "../field/condition";

export function formFields<
	B extends Form.Basics,
	F extends Form.Fields<B>,
	O extends Form.Options<F>,
>(props: { basics: B; options: O }) {
	const { basics, options } = props;
	const fields = {} as F;
	const form_init = {
		values: {} as any,
		conditions: {} as any,
		errors: null as any,
		extras: {} as any,
		incomplete: [],
		// focused: false,
		status: "valid",
	} as Form.StoreObject<F>;
	for (const key in basics) {
		const basic = basics[key];
		const field = fieldOptionsProcessor({ key, basic, options });
		const condition = fieldCondition({ key, field });
		// @ts-ignore
		fields[key] = field;
		form_init.values[key as any] = field.value as any;
		form_init.conditions[key as any] = condition;

		// if (!condition.element.disabled && condition.element.required) {}
		// if (!condition.valid) {
		// 	form_init.status = "idle";
		// }
	}

	return { fields, form_init };
}
