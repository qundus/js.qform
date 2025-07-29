import { type _QSTATE, map, onMount, task, onSet } from "@qundus/qstate";
import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Fields, FormObject, Options } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import isKeyInFields from "../checks/is-key-in-fields";
import onValue from "../interactions/on-value";
import { updateAddon, deriveAddon } from "@qundus/qstate/addons";

// types
export type FormState<F extends Fields> = _QSTATE.NanoMap<FormObject<F>>;

// store
export type FormStore<F extends Fields, O extends Options<any>> = _QSTATE.Store<
	FormState<F>,
	{
		addons: {
			derive: typeof deriveAddon;
			update: typeof updateAddon;
		};
		hooks: O["hooks"];
		// events: O["events"]; // no need
	}
>;
export default function prepareFormStore<F extends Fields, O extends Options<F>>(props: {
	fields: F;
	options: O;
	form_init: FormObject<F>;
}) {
	const { fields, form_init, options } = props;
	const $store = map(form_init, {
		hooks: options.hooks,
		addons: {
			derive: deriveAddon,
			update: updateAddon,
		},
	});

	onMount($store, () => {
		const ureturns = task(async () => {
			const serverSide = isServerSide();
			if (serverSide) {
				return;
			}
			const ureturns =
				options?.onMount?.({
					...props,
					init: form_init,
					update: (values) => {
						//
						if (typeof values === "undefined") {
							return;
						}
						const $form = { ...$store.get() };
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
								value,
								event: null,
							});
						}
						$store.set($form);
					},
				}) ?? null;
			return ureturns;
		});

		return () => {
			if (ureturns != null && typeof ureturns === "function") {
				// @ts-ignore
				ureturns?.();
			}
		};
	});

	onSet($store, ($next) => {
		const next = $next.newValue as typeof $store.value;
		options?.onChange?.($next);
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
	});

	return $store as FormStore<F, O>;
}
