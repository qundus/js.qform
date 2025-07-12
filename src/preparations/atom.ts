import type { ElementProps, Field, FieldCondition, FieldOptions, FieldValidate } from "../_model";
import { PLACEHOLDERS } from "../const";
import onValue from "../interactions/on-value";
import mergeConditions from "../methods/merge-conditions";
import prepareFieldElement from "../preparations/field-element";
import prepareFieldState from "../preparations/field-state";

export default function prepareAtom<F extends Field>(props: ElementProps<F>) {
	const { key, field, $state } = props;
	const { derived } = prepareFieldState(props);
	// F["options"] extends never
	// 	? never
	// 	: F["options"] extends any[]
	// 		? Extract<F["options"], any[]>
	// 		: Extract<F["options"], Function>
	return {
		// field,
		key,
		type: field.type,
		label: field.label,
		$state: derived,
		get element() {
			return prepareFieldElement({ ...props, derived });
		},
		get placeholders() {
			return PLACEHOLDERS;
		},
		getOptions: field.options ?? null,
		get addValidation() {
			return (func: FieldValidate) => {
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
						field.validate = field.validate.filter((item, index) => index !== idx);
						if (field.validate.length <= 0) {
							field.validate = null;
						}
					}
				};
			};
		},
		updateValue: (
			value: F["value"] | ((prev: F["value"]) => void),
			configs?: { preprocessValue?: boolean },
		) => {
			const prev = $state.get().values[key];
			const current = typeof value === "function" ? (value as any)(prev) : value;
			$state.update((next) => {
				onValue({ ...props, $next: next, event: null, value: current, ...configs });
				return next;
			});
		},
		clearValue: () => {
			$state.update((next) => {
				onValue({ ...props, $next: next, event: null, value: null, preprocessValue: false });
				return next;
			});
		},
		updateCondition: (
			value: Partial<FieldCondition> | ((prev: Partial<FieldCondition>) => Partial<FieldCondition>),
		) => {
			const prev = $state.get().values[key];
			const newCondition = typeof value === "function" ? (value as any)(prev) : value;
			$state.update(($next) => {
				$next.conditions[key] = mergeConditions($next.conditions[key], newCondition);
				return $next;
			});
		},
	};
}
