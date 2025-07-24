import type { _QSTATE } from "@qundus/qstate";
import type { ElementProps, Field, FieldCondition, FieldExtras, Options } from "../_model";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export type FieldStoreObject<F extends Field> = {
	value: F["value"] | null | undefined;
	condition: FieldCondition;
	errors?: string[] | null;
	extras?: FieldExtras<F["type"]>;
};
export type FieldStore<F extends Field, O extends Options<any, any>> = _QSTATE.DerivedStore<
	FieldStoreObject<F>,
	O["state"]
>;
export default function prepareFieldStore<F extends Field, O extends Options<any, any>>(
	props: ElementProps<F, O>,
) {
	const { key, field, $store, options } = props;
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
		return value;
	});

	return derived as FieldStore<F, O>; //as PrepareFieldState<F>;
}
