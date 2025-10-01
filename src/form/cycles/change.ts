import { effect, task, batched, computed } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { CYCLE } from "../../const";
import { isServerSide } from "@qundus/qstate/checks";

export function changeCycle<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormCycle<F, O>,
	update: Addon.FormUpdate<F, O>,
) {
	const { fields, store, options } = props;
	const stores = [] as Field.Store<any, O>[];
	for (const key in fields) {
		const field = fields[key];
		stores.push(field.store as any);
	}
	effect(stores, (...stores) => {
		const $next = { ...store.get() } as Form.StoreObject<F, O>;
		const count = {
			invalids: 0,
			errors: 0,
			incompletes: 0,
			mounted: 0,
		};
		// reset
		$next.errors = {} as any;
		$next.extras = {} as any;
		$next.incomplete = [];

		for (const store of stores) {
			//
			const key = store.__internal.key as any;
			if (key == null || typeof key !== "string") {
				console.log("qform: key is undefined for store ", store);
				continue;
			}
			//
			count.mounted += store.event.CYCLE > CYCLE.MOUNT ? 1 : 0;
			// @ts-expect-error
			$next.values[key] = store.value;
			// @ts-expect-error
			$next.elements[key] = store.element;
			// @ts-expect-error
			$next.conditions[key] = store.condition;
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
			if (condition.error) {
				$next.incomplete.push(key);
				count.errors++;
				if (condition.error === "incomplete") {
					count.incompletes++;
				}
			}
		}

		// before proceeding, check if all fields mounted
		const allFieldsMounted = count.mounted >= stores.length;
		if (!allFieldsMounted) {
			store.set({ ...$next });
			return;
		}

		// finally, assign form status
		if (count.incompletes > 0 || count.errors > 0) {
			$next.status = count.errors > 0 ? "error" : "incomplete";
		} else if (count.invalids > 0) {
			$next.status = "idle";
		} else {
			$next.status = "valid";
		}

		const eventprops = {
			form: $next,
			prev: store.get(),
			isServerSide,
			fields,
			getForm: () => store.get(),
			update,
		};
		if (eventprops.prev.status === "mount") {
			task(async () => {
				await options?.onMount?.(eventprops, (stores, func) => {
					if (isServerSide()) {
						return;
					}
					let init = true;
					effect(stores, (...values) => {
						if (init) {
							init = false;
							return;
						}
						task(async () => {
							await func(...values);
						});
					});
				});
			});
		} else {
			options?.onEffect?.(eventprops);
		}

		// console.log("form batched :: ", $next);
		store.set({ ...$next });
	});
}
