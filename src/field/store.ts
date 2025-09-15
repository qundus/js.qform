import { onMount, type _QSTATE, atom, task } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../_model";
import { isServerSide } from "@qundus/qstate/checks";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export function fieldStore<F extends Field.Options, O extends Form.Options<any>>(
	props: FunctionProps.Basic<F, O>,
) {
	const { key, field, $store } = props;
	//
	const derived = $store.derive((form) => {
		let value = {
			value: form?.values?.[key],
			condition: form?.conditions?.[key],
			errors: form?.errors?.[key],
			extras: form?.extras?.[key], // as FieldExtras<F["type"]>,
		} as Field.StoreObject<F>;

		const next = field?.processState?.({
			form,
			$value: value,
		});

		if (next != null) {
			value = next as any;
		}
		return value;
	});

	return derived as Field.Store<F, O>; //as PrepareFieldState<F>;
}
