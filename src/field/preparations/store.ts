import { atom } from "@qundus/qstate";
import { hooksInUseAddon } from "@qundus/qstate/addons";
import type { Field, Form } from "../../_model";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export function prepareStore<S extends Field.Setup, O extends Form.Options>(
	init: Field.StoreObject<S>,
	options: O | undefined,
) {
	// create state
	const store = atom(init, {
		hooks: options?.storeHooks,
		addons: {
			hooksUsed: hooksInUseAddon,
		},
	}) as Field.Store<S, O>;

	return store;
}
