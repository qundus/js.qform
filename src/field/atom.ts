import type { Field, Form, FunctionProps } from "../_model";
import { PLACEHOLDERS } from "../const";
import { valueInteraction } from "../interactions/value";
import { mergeFieldConditions } from "../methods/merge-field-conditions";
import { fieldElement } from "./element";
import { fieldStore } from "./store";

export function fieldAtom<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
) {
	const { key, field, $store } = basic;
	const derived = fieldStore<F, O>(basic);
	return {
		// field,
		key,
		type: field.type,
		label: field.label ?? key,
		$store: derived,
		get element() {
			return fieldElement<F, O>(basic, derived);
		},
		get placeholders() {
			return PLACEHOLDERS;
		},
		// getOptions: field.options ?? null,
		get addValidation() {
			return (func: Field.Validate) => {
				if (func == null || typeof func !== "function") {
					return null;
				}
				let idx = null as number | null;
				if (field.validate == null) {
					field.validate = func;
				} else if (Array.isArray(field.validate)) {
					idx = field.validate.push(func);
					idx--;
				} else {
					field.validate = [field.validate, func];
					idx = 1;
				}
				return () => {
					if (typeof field.validate === "function") {
						field.validate = null;
					} else {
						if (field.validate != null) {
							field.validate = field.validate.filter((item, index) => index !== idx);
							if (field.validate.length <= 0) {
								field.validate = null;
							}
						}
					}
				};
			};
		},
		updateValue: (value, configs) => {
			const prev = $store.get().values[key];
			const current = typeof value === "function" ? (value as any)(prev) : value;
			$store.update(({ $next: $form }) => {
				valueInteraction(basic, { $form, event: null, value: current, ...configs });
				return $form;
			});
		},
		clearValue: () => {
			$store.update(({ $next: $form }) => {
				valueInteraction(
					basic,
					{ $form, event: null, value: null },
					{ manualUpdate: true, preprocessValue: false },
				);
				return $form;
			});
		},
		updateCondition: (value) => {
			const prev = $store.get().values[key];
			const newCondition = typeof value === "function" ? (value as any)(prev) : value;
			$store.update(({ $next: $form }) => {
				$form.conditions[key] = mergeFieldConditions($form.conditions[key], newCondition);
				return $form;
			});
		},
	} as Field.Atom<F, O>;
}
