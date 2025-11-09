import { onMount, task } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";

export function mountCycle<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	update: Addon.FieldUpdate<S, O>,
) {
	const { setup, store } = props;
	const next_cycle = update.cycle(setup.initCycle);
	onMount(store, () => {
		let ureturns = null as null | void | (() => void);
		if (setup.onMount) {
			task(async () => {
				ureturns = await setup?.onMount?.({
					setup,
					update: update as any,
					SSR: setup.ssr as boolean,
				});
				next_cycle?.();
			});
		} else {
			next_cycle?.();
		}
		return () => {
			if (ureturns != null && typeof ureturns === "function") {
				ureturns();
			}
		};
	});
}

// should reset field here
// check validity
// console.log("form store mounts :: ", $store.get());
// const form = form_init;
// const conditions = form.conditions;
// const start = {
// 	status: form.status,
// };
// for (const key in conditions) {
// 	const field = fields[key];
// 	const valid = conditions[key].valid;
// 	// setup file types
// 	if (field.type === "file" && field.value != null) {
// 		// const value = processFileValue(
// 		// 	{ $store: $store as any, field, key, options },
// 		// 	{ event: null, value: field.value },
// 		// 	{ manualUpdate: true, preprocessValue: true },
// 		// 	form,
// 		// );
// 		// $store.setKey()
// 	}
// 	if (!valid) {
// 		start.status = "idle";
// 	}
// }
// if (start.status !== form.status) {
// 	$store.setKey("status", start.status);
// }
//
