import { type Field, type Form, FunctionProps } from "../_model";
import { prepareOptions } from "../form/preparations/options";
import { prepareSetup } from "./preparations/setup";
import { prepareStore } from "./preparations/store";

//
import { changeCycle } from "./cycles/change";
import { createElement } from "./elements";
import { PLACEHOLDERS } from "../const";
import { mergeFieldConditions } from "../methods/merge-field-conditions";

//
export function createField<F extends Field.FactoryIn, O extends Form.Options<any>>(
	key: string,
	inn: F,
	_formOptions?: O,
	formActions?: Form.StoreObject<Form.Fields<any>>,
) {
	type S = typeof setup;
	// preparation
	const options = prepareOptions(_formOptions) as any;
	const setup = prepareSetup<F, O>(key, inn, options);
	const store = prepareStore<S, O>(key, setup, options);

	// elements
	const element = createElement({ key, setup, options, store });

	// cycles
	changeCycle(key, setup, options, formActions, store);

	//

	return {
		key,
		type: setup.type,
		label: setup.label ?? key,
		store: { ...store, set: null } as Omit<typeof store, "set">,
		get element() {
			return element;
		},
		get placeholders() {
			return PLACEHOLDERS;
		},
		// getOptions: field.options ?? null,
		add: {
			validation() {
				return (func: Field.Validate) => {
					if (func == null || typeof func !== "function") {
						return null;
					}
					let idx = null as number | null;
					if (setup.validate == null) {
						setup.validate = func;
					} else if (Array.isArray(setup.validate)) {
						idx = setup.validate.push(func);
						idx--;
					} else {
						setup.validate = [setup.validate, func];
						idx = 1;
					}
					return () => {
						if (typeof setup.validate === "function") {
							setup.validate = null;
						} else {
							if (setup.validate != null) {
								setup.validate = setup.validate.filter((_item, index) => index !== idx);
								if (setup.validate.length <= 0) {
									setup.validate = null;
								}
							}
						}
					};
				};
			},
		},
		update: {
			value: (_value, configs) => {
				const state = { ...store.get() };
				const prev = state.value;
				const value = typeof _value === "function" ? _value(prev) : _value;
				store.set({
					...state,
					value,
					__internal: {
						update: "value",
						manual: true,
						preprocess: configs?.preprocess,
						event: undefined,
					},
				});
			},
			condition: (value, configs) => {
				const state = { ...store.get() };
				const prev = state.condition;
				const userCondition = typeof value === "function" ? value(prev) : value;
				const condition = mergeFieldConditions(prev, userCondition);
				store.set({
					...state,
					condition,
					__internal: {
						update: "value",
						manual: true,
						preprocess: configs?.preprocess,
						event: undefined,
					},
				});
			},
		},
		clear: {
			value: () => {
				const state = { ...store.get() };
				store.set({
					...state,
					value: null,
					__internal: {
						update: "value",
						manual: true,
						preprocess: true,
						event: undefined,
					},
				});
			},
		},
	};
}
