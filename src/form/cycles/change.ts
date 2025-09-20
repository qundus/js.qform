import { _QSTATE, batched, effect } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../../_model";

export function changeCycle<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormCycle<F, O>,
) {
	const { fields, options, store } = props;
	const stores = [] as Field.Store<any, O>[];
	for (const key in fields) {
		const field = fields[key];
		stores.push(field.store as any);
	}
	effect(stores, (...stores) => {
		const $next = { ...store.get() } as Form.StoreObject<F>;
		// if ($next.status === "submit") {
		// 	// TODO: apply locks on fields
		// 	return;
		// }
		const count = {
			invalids: 0,
			errors: 0,
			incompletes: 0,
		};
		// reset
		$next.errors = {} as any;
		$next.extras = {} as any;
		$next.incomplete = [];
		for (const store of stores) {
			//
			const key = store.__key;
			if (key == null || typeof key !== "string") {
				console.log("qform: key is undefined for store ", store);
				continue;
			}
			// @ts-expect-error
			$next.conditions[key] = store.condition;
			// @ts-expect-error
			$next.values[key] = store.value;
			if (store.errors) {
				// @ts-expect-error
				$next.errors[key] = store.errors;
			}
			if (store.extras) {
				$next.extras[key] = store.extras;
			}

			//
			const condition = store.condition;
			if (condition.valid) {
				continue;
			}
			count.invalids++;
			if (condition.value.error) {
				$next.incomplete.push(key);
				count.errors++;
				if (condition.value.error === "incomplete") {
					count.incompletes++;
				}
			}
		}

		// finally, assign form status
		if (count.incompletes > 0 || count.errors > 0) {
			$next.status = count.errors > 0 ? "error" : "incomplete";
		} else if (count.invalids > 0) {
			$next.status = "idle";
		} else {
			$next.status = "valid";
		}

		// console.log("form batched :: ", $next);
		store.set({ ...$next });
	});
}
