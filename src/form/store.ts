import { type _QSTATE, map, onMount, task, onSet } from "@qundus/qstate";
import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Form } from "../_model";
import { isFieldIncomplete } from "../field/checks/is-field-incomplete";
import { isKeyInFormFields } from "./checks/is-key-in-form-fields";
import { valueInteraction } from "../interactions/value";
import { updateAddon, deriveAddon } from "@qundus/qstate/addons";
import { updateAddon as formUpdateAddon } from "../addons/update";

export function formStore<F extends Form.Fields, O extends Form.Options<F>>(
	fields: F,
	options: O,
	form_init: Form.StoreObject<F>,
) {
	const $store = map(form_init, {
		hooks: options.hooks, //as O["hooks"],
		addons: {
			derive: deriveAddon,
			update: updateAddon,
		},
	});

	onMount($store, () => {
		// check validity
		// console.log("form store mounts :: ", $store.get());
		const conditions = $store.get().conditions;
		for (const key in conditions) {
			const valid = conditions[key].valid;
			if (!valid) {
				$store.update(({ $next }) => {
					$next.status = "idle";
					return $next;
				});
				break;
			}
		}
		//
		const ureturns = task(async () => {
			const serverSide = isServerSide();
			if (serverSide) {
				return;
			}
			//
			const voidOrFunc = await options?.onMount?.(
				form_init,
				formUpdateAddon({ fields, options, $store: $store as any }),
			);
			return voidOrFunc;
		});

		return () => {
			$store.set(form_init);
			if (ureturns != null && typeof ureturns === "function") {
				// @ts-ignore
				ureturns?.();
			}
		};
	});

	onSet($store, ($next) => {
		options?.onChange?.($next.newValue, { abort: $next.abort });
		const next = $next.newValue; //as typeof $store.value;
		// check form status
		if (next.status === "submit") {
			return;
		}
		next.status = "valid";
		next.incomplete = [];
		let errors = 0;
		let incompletes = 0;
		// global incompletes do not affect individual's
		for (const key in fields) {
			const value = next.values[key];
			const field = fields[key] as Form.Fields[number];
			const condition = next.conditions[key];
			const error = next.errors?.[key];
			let incomplete = false;

			// first check errors
			if (error != null) {
				// console.log("onchange error :: ", key, " :: ", error);
				if (condition.hidden) {
					condition.valid = true;
				} else if (condition.value.error === "optional") {
					condition.valid = true;
				} else {
					errors++;
					condition.valid = false;
				}
				// TODO: continue/break here maybe?!
			} else if (condition.value.error === "incomplete") {
				incomplete = true;
			} else {
				incomplete = field.incompleteStatus ? isFieldIncomplete(field, condition, value) : false;
			}

			// if any field triggers incomplete form status, update it
			if (incomplete) {
				incompletes++;
				condition.valid = false;
				if (options.incompleteListCount) {
					if (typeof options.incompleteListCount === "boolean") {
						next.incomplete.push(key);
					} else if (next.incomplete.length < options.incompleteListCount) {
						next.incomplete.push(key);
					}
				}
			} else {
				condition.valid = condition.value.error !== "validation";
			}
		}

		// finally check for the status and cleanup what's necessary
		if (incompletes > 0) {
			// prioritizing incomplete until there's errors
			next.status = "incomplete";
		}
		if (errors <= 0) {
			next.errors = null;
		} else {
			next.status = "error"; // takes precedence over incomplete status
		}
		// console.log("form status :: ", next);
	});

	return $store as Form.Store<F, O>;
}
