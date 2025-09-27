import { onMount, task } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { processValue } from "../processors/value";

export function mountCycle<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	update: Addon.FieldUpdate<S, O>,
	mark: Addon.FieldMark<S, O>,
) {
	const { key, setup, options, store, init } = props;
	// do startup checks for input types like file
	if (setup.value != null) {
		const shouldCheck = setup.type === "file" || setup.type === "select" || setup.type === "radio";
		if (shouldCheck) {
			const value = processValue(props, {
				$next: init,
				event: undefined,
				value: setup.value,
				manualUpdate: true,
				preprocessValue: true,
			});
			update.value(value);
		}
	}

	mark.cycle.mount();
	onMount(store, () => {
		let ureturns = null as null | void | (() => void);
		if (setup.onMount) {
			task(async () => {
				ureturns = await setup?.onMount?.({ setup, mark, update: update as any });
				mark.cycle.change();
			});
		} else {
			mark.cycle.change();
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
