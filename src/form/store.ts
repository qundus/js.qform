import { onMount, task, onSet, deepMap, onNotify } from "@qundus/qstate";
import { isServerSide } from "@qundus/qstate/checks";
import type { Form } from "../_model";
import { isFieldIncomplete } from "../field/checks/is-field-incomplete";
import { deriveAddon } from "@qundus/qstate/addons";
import { updateAddon as formUpdateAddon } from "../addons/update";
import { processValidation } from "../interactions/processors/validation";
import { processFileValue } from "../interactions/processors/value/file";

export function formStore<O extends Form.Options<any>>(
	// fields: F,
	options: O,
	// form_init: Form.StoreObject<F>,
) {
	const $store = deepMap(
		{
			values: {} as any,
			conditions: {} as any,
			errors: {} as any,
			extras: {} as any,
			incomplete: [],
			status: "valid",
			changed: undefined,
		} as Form.StoreObject<any>,
		{
			hooks: options.hooks, //as O["hooks"],
			addons: {
				derive: deriveAddon,
			},
		},
	);

	return {
		$store,
		onMount: <F extends Form.Fields>(fields: F) => {
			onMount($store, () => {
				// check validity
				// console.log("form store mounts :: ", $store.get());
				const form = form_init;
				const conditions = form.conditions;
				const start = {
					status: form.status,
				};
				for (const key in conditions) {
					const field = fields[key];
					const valid = conditions[key].valid;
					// setup file types
					if (field.type === "file" && field.value != null) {
						// const value = processFileValue(
						// 	{ $store: $store as any, field, key, options },
						// 	{ event: null, value: field.value },
						// 	{ manualUpdate: true, preprocessValue: true },
						// 	form,
						// );
						// $store.setKey()
					}
					if (!valid) {
						start.status = "idle";
					}
				}
				if (start.status !== form.status) {
					$store.setKey("status", start.status);
				}
				//
				const ureturns = task(async () => {
					const voidOrFunc = await options?.onMount?.({
						isServerSide,
						form: form_init,
						update: formUpdateAddon({ setups: fields, options, $store: $store as any }),
					});
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
		},
		onChange: () => {
			let internal_change = false;
			onSet($store, async (payload) => {
				// processing
				const $next = payload.newValue; //as typeof $store.value;
				const changed = payload.changed as string | undefined;

				// check form status first
				if ($next.status === "submit" || internal_change) {
					internal_change = false;
					return;
				}
				if (changed) {
					const idx = changed.indexOf("[");
					const value = $next[changed];
					let root = undefined as undefined | string;
					let key = undefined as undefined | string;
					// has key update
					if (idx > 0) {
						root = changed.substring(0, idx);
						key = changed.substring(idx + 1, changed.length - 1);
					} else {
						root = changed;
					}
					$next.changed = { root, key, value };
					if (key) {
						// @ts-expect-error
						$next[root][key] = value;
						// remove set key
						delete $next[changed];
					} else {
						$next[root] = value;
					}
				}

				// then user changes, and move on with logic
				const $options: Parameters<Exclude<O["onChange"], undefined>>[0]["$options"] = {
					validate: false,
				};
				try {
					await options?.onChange?.({
						$next,
						isServerSide,
						abort: payload.abort,
						$options,
						// update: formUpdateAddon({ fields, options, $store: $store as any }),
					});
				} catch (err: any) {
					console.error(
						`qform: fatal error occured in options.onChange :: abort set to <${options.abortOnChangeException}> :: exception :: `,
						err,
					);
					if (options.abortOnChangeException) {
						payload.abort();
						return;
					}
				}

				$next.status = "valid";
				$next.incomplete = [];
				let errors = 0;
				let incompletes = 0;

				// TODO: for loop can be massively optimized after the per-key state updates
				// global incompletes do not affect individual's
				for (const key in fields) {
					const field = fields[key] as Form.Fields[number];
					let $user = {
						value: $next.values[key],
						condition: $next.conditions[key],
						errors: $next.errors[key],
					};
					if ($options.validate) {
						if (
							$options.validate === true ||
							(Array.isArray($options.validate) && $options.validate.includes(key)) ||
							$options.validate === key
						) {
							$user = processValidation(
								{ setup: field, key, options },
								{ manualUpdate: true, preprocessValue: true },
								$next,
								$user,
							);
						}
					}
					let incomplete = false;

					// first check errors
					if ($user.errors != null) {
						// console.log("onchange error :: ", key, " :: ", error);
						if ($user.condition.hidden) {
							$user.condition.valid = true;
						} else if ($user.condition.value.error === "optional") {
							$user.condition.valid = true;
						} else {
							errors++;
							$user.condition.valid = false;
						}
						// TODO: continue/break here maybe?!
					} else if ($user.condition.value.error === "incomplete") {
						incomplete = true;
					} else {
						incomplete = field.incompleteStatus
							? isFieldIncomplete(field, $user.condition, $user.value)
							: false;
					}

					// if any field triggers incomplete form status, update it
					if (incomplete) {
						incompletes++;
						$user.condition.valid = false;
						if (options.incompleteListCount) {
							if (typeof options.incompleteListCount === "boolean") {
								$next.incomplete.push(key);
							} else if ($next.incomplete.length < options.incompleteListCount) {
								$next.incomplete.push(key);
							}
						}
					} else {
						$user.condition.valid = $user.condition.value.error !== "validation";
					}
				}

				// finally check for the status and cleanup what's necessary
				if (incompletes > 0) {
					// prioritizing incomplete until there's errors
					$next.status = "incomplete";
				}
				if (errors > 0) {
					// 	$next.errors = null;
					// } else {
					$next.status = "error"; // takes precedence over incomplete status
				}

				// we got specific key changes, apply whole store update
				if (changed) {
					internal_change = true;

					$store.set($next);
					// abort and return actual state
					payload.abort();
				}
			});
		},
	};
}
