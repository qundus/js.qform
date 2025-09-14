import type { _QSTATE } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../_model";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!

export function fieldStore<F extends Field.Options, O extends Form.Options<any>>(
	props: FunctionProps.Basic<F, O>,
) {
	const { key, field, $store } = props;
	const derived = $store.derive((form) => {
		const value = {
			value: form.values?.[key],
			condition: form.conditions?.[key],
			errors: form.errors?.[key],
			extras: form.extras?.[key], //as FieldExtras<F["type"]>,
		};
		if (field.onChange != null && typeof field.onChange === "function") {
			field.onChange({
				$value: value,
				form,
			});
			// if (next != null && typeof next === "object") {
			// 	// @ts-ignore
			// 	value = next;
			// }
		}
		// console.log("form: condition of ", key, " :: ", JSON.stringify(value.condition));
		return value as Field.StoreObject<F>;
	});

	return derived as Field.Store<F, O>; //as PrepareFieldState<F>;
}
