import type {
	ElementProps,
	Field,
	FieldCondition,
	FieldStore,
	FieldValidate,
	Options,
} from "../_model";
import { PLACEHOLDERS } from "../const";
import onValue from "../interactions/on-value";
import mergeConditions from "../methods/merge-conditions";
import prepareFieldElement from "../preparations/field-element";
import prepareFieldState from "../preparations/field-state";

export type FieldAtom<F extends Field, O extends Options<any, any>> = {
	$store: FieldStore<F, O>;
	$hooks: FieldStore<F, O>["hooks"];
	$listen: FieldStore<F, O>["listen"];
	$subscribe: FieldStore<F, O>["subscribe"];
	key: string;
	type: F["type"];
	label: string;
	getOptions?: F["options"];
	get element(): ReturnType<typeof prepareFieldElement<F>>;
	placeholders: typeof PLACEHOLDERS;
	get addValidation(): (func: FieldValidate) => (() => void) | null;
	updateValue: (
		value: F["value"] | ((prev: F["value"]) => void),
		configs?: { preprocessValue?: boolean },
	) => void;
	clearValue: () => void;
	updateCondition: (
		value: Partial<FieldCondition> | ((prev: Partial<FieldCondition>) => Partial<FieldCondition>),
	) => void;
};
export default function prepareAtom<F extends Field, O extends Options<any, any>>(
	props: ElementProps<F, O>,
): FieldAtom<F, O> {
	const { key, field, $store } = props;
	const derived = prepareFieldState<F>(props);
	return {
		// field,
		key,
		type: field.type,
		label: field.label,
		$store: derived,
		$hooks: derived.hooks,
		$subscribe: derived.subscribe,
		$listen: derived.listen,
		get element() {
			return prepareFieldElement<F>({ ...props, derived });
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
		updateValue: (value, configs) => {
			const prev = $store.get().values[key];
			const current = typeof value === "function" ? (value as any)(prev) : value;
			$store.update((next) => {
				onValue({ ...props, $next: next, event: null, value: current, ...configs });
				return next;
			});
		},
		clearValue: () => {
			$store.update((next) => {
				onValue({ ...props, $next: next, event: null, value: null, preprocessValue: false });
				return next;
			});
		},
		updateCondition: (value) => {
			const prev = $store.get().values[key];
			const newCondition = typeof value === "function" ? (value as any)(prev) : value;
			$store.update(($next) => {
				$next.conditions[key] = mergeConditions($next.conditions[key], newCondition);
				return $next;
			});
		},
	};
}
