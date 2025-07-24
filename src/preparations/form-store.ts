import { type _QSTATE, map } from "@qundus/qstate";
import type { Field, Fields, FormObject, Options } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import isKeyInFields from "../checks/is-key-in-fields";
import onValue from "../interactions/on-value";

// types
export type FormState<F extends Fields> = _QSTATE.NanoMap<FormObject<F>>;

// store
export type FormStore<F extends Fields, O extends Options<any, any>> = _QSTATE.Store<
	FormState<F>,
	O["state"]
>;
export default function prepareFormStore<F extends Fields, O extends Options<F, any>>(props: {
	fields: F;
	options: O;
	form_init: FormObject<F>;
}) {
	const { fields, form_init, options } = props;
	const $store = map(form_init, {
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
					form: form_init,
					update(values) {
						if (typeof values === "undefined") {
							return;
						}
						actions.update(($form) => {
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
									$form,
									// $store: state,
									value,
									event: null,
								});
							}
							return $form;
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
			options?.onChange?.({ ...payload, $form: next });
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

	return $store as FormStore<F, O>;
}
