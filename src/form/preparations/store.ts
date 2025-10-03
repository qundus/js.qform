import { map } from "@qundus/qstate";
import type { Form } from "../../_model";
import { deriveAddon } from "@qundus/qstate/addons";
import { FORM } from "../../const";

export function prepareStore<F extends Form.Fields, O extends Form.Options<F>>(options: O) {
	const init = {
		values: {} as any,
		conditions: {} as any,
		errors: {} as any,
		extras: {} as any,
		elements: {},
		incomplete: [],
		props: options?.props,
		status: FORM.STATUS.INIT,
	} as Form.StoreObject<any, O>;
	const store = map(init, {
		hooks: options.storeHooks as O["storeHooks"],
		addons: {
			derive: deriveAddon,
		},
	});

	return store as Form.Store<F, O>;
}
