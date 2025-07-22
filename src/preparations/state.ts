import { map } from "@qundus/qstate";
import type { Field, Fields, Options, StateObject, Store } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import isKeyInFields from "../checks/is-key-in-fields";
import onValue from "../interactions/on-value";

export default function prepareState<F extends Fields, O extends Options<F, any>>(props: {
	fields: F;
	options: O;
	state_init: StateObject<F>;
}): Store<F, O> {
	const { fields, state_init, options } = props;
	const $store = map(state_init, {
		...options.state,
		async onMount(props) {
			const { checks, actions, state } = props;
			if (checks.isServerSide()) {
				return;
			}
			const ureturns = options?.state?.onMount?.(props) ?? null;
			if (options.onMount == null) {
				return ureturns;
			}
			try {
				await options.onMount({
					init: state_init,
					update(values) {
						if (typeof values === "undefined") {
							return;
						}
						actions.update(($next) => {
							for (const key in values) {
								const value = values[key];
								const field = fields[key as keyof typeof fields] as Field;
								if (!isKeyInFields(fields, key, options)) {
									continue;
								}
								onValue({
									key,
									field,
									options,
									$next,
									$store,
									value,
									event: null,
								});
							}
							return $next;
						});
					},
				});
			} catch (e: any) {
				options?.onMountError?.(e);
			}
			return ureturns;
		},
		onChange(props) {
			const { payload } = props;
			const next = payload.newValue as typeof $store.value;
			options?.state?.onChange?.(props);
			options?.onChange?.({ ...payload, $next: next });
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
				const field = fields[key] as Fields[number];
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
					incomplete = field.incompleteStatus
						? isFieldIncomplete({ value, condition, field })
						: false;
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

			// console.log("form: ", next);
			//
		},
	});
	return $store;
}
