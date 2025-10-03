import { atom } from "@qundus/qstate";
import { hooksInUseAddon } from "@qundus/qstate/addons";
import type { Field, Form } from "../../_model";
export function prepareStore<S extends Field.Setup, O extends Form.Options>(
	options: O | undefined,
) {
	// create state
	const store = atom(
		{},
		{
			hooks: options?.storeHooks as O["storeHooks"],
			addons: {
				hooksUsed: hooksInUseAddon,
			},
		},
	) as Field.Store<S, O>;

	return store;
}
