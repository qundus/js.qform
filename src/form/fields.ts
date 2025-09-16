import type { Form } from "../_model";
import { processFieldOptions } from "../field/processors/field-options";
import { fieldCondition } from "../field/condition";

export function formFields<
	B extends Form.Basics,
	F extends Form.Fields<B>,
	O extends Form.Options<F>,
>(basics: B, options: O) {
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
		const field = processFieldOptions(basic, options, key);
		const condition = fieldCondition(key, field);
		// @ts-expect-error
		fields[key] = field;
		form_init.values[key as any] = field.value;
		form_init.conditions[key as any] = condition;
	}

	return { fields, form_init };
}
