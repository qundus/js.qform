import { onMount, task, onSet, map } from "@qundus/qstate";
import { isServerSide } from "@qundus/qstate/checks";
import type { Form } from "../../_model";
import { deriveAddon } from "@qundus/qstate/addons";

export function prepareStore<F extends Form.Fields, O extends Form.Options<F>>(options: O) {
	const init = {
		values: {} as any,
		conditions: {} as any,
		errors: {} as any,
		extras: {} as any,
		elements: {},
		incomplete: [],
		status: "mount",
	} as Form.StoreObject<any>;
	const store = map(init, {
		hooks: options.storeHooks, //as O["hooks"],
		addons: {
			derive: deriveAddon,
		},
	});

	return store as Form.Store<F, O>;
}
