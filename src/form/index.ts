import type { Form, FunctionProps } from "../_model";
import { PLACEHOLDERS } from "../const";

// checks
import { checkFormBasics } from "./checks/check-form-basics";

// addons
import { formSubmitAddon } from "../addons/form/submit";
import { formUpdateAddon } from "../addons/form/update";
import { formValuesAddon } from "../addons/form/values";
import { formButtonAddon } from "../addons/form/button";

// form
import { formAtoms } from "./atoms";
import { prepareFields } from "./preparations/fields";
import { prepareStore } from "./preparations/store";
import { setupOptionsMerger } from "../methods/setup-options-merger";
import { prepareOptions } from "./preparations/options";
import { mountCycle } from "./cycles/mount";
import { changeCycle } from "./cycles/change";

export function createForm<
	I extends Form.FieldsIn,
	F extends Form.Fields<I>,
	O extends Form.Options<F>,
>(inn?: I, _options?: O): Form.Factory<I, F, O> {
	// preparations
	const options = prepareOptions<O>(_options);
	const store = prepareStore<F, O>(options as any);
	const fields = prepareFields<I, F, O>(inn, options as any);

	// addons (forced for now)
	const addonProps = { fields, options, store } as FunctionProps.FormAddon<F, O>;
	const submit = formSubmitAddon<F, O>(addonProps);
	const update = formUpdateAddon<F, O>(addonProps);
	const values = formValuesAddon<F, O>(addonProps);
	const button = formButtonAddon<F, O>(addonProps);

	// cycles
	mountCycle(addonProps, update);
	changeCycle(addonProps);

	// other helpers
	let keys = null as (keyof F)[] | null;
	return {
		store,
		fields: fields as any,
		placeholders: PLACEHOLDERS,
		options: options as any,
		get keys() {
			return () => {
				if (keys == null) {
					keys = Object.keys(fields ?? {}) as unknown as typeof keys;
				}
				return keys as (keyof F)[];
			};
		},
		// addons
		submit,
		update,
		values,
		button,
	};
}

// export function formSetup<G extends Form.Options>(base?: G) {
// 	const optionsMerger = setupOptionsMerger(base);
// 	return <B extends Form.Basics, F extends Form.Fields<B>, D extends Form.Options<F>>(
// 		basics: B,
// 		doptions?: D,
// 	) => {
// 		const options = optionsMerger<D>(doptions);
// 		return form<B, F, typeof options>(basics, options);
// 	};
// }

// test types
// const form = createForm()

// field(field: Keys) {
// 	const n = form.getFieldState(field);
// 	return state.atom({
// 		error: n?.error,
// 		value: n?.value,
// 		active: n?.active,
// 		dirty: n?.dirty,
// 		invalid: n?.invalid,
// 		modified: n?.modified,
// 		name: n?.name,
// 		touched: n?.touched,
// 		valid: n?.valid,
// 		validating: n?.validating,
// 		visited: n?.visited,
// 	});
// },

// const form = cf<FieldsWithInits<T>>({
// 	initialValues: inits,
// 	validate(values) {
// 		// return undefined;
// 		console.log("validating values :: ", values);
// 		let errors = null as unknown as Record<string, string>;
// 		for (const key in fields) {
// 			const inits = fields[key];
// 			if (inits == null || typeof inits !== "object") {
// 				continue;
// 			}
// 			if ("init" in inits) {
// 				const settings = inits as any;
// 				const err = settings.validate?.(values[key]);
// 				if (err != null) {
// 					if (errors == null) errors = {};
// 					errors[key] = err;
// 				}
// 			}
// 		}
// 		state.set({ errors });
// 		return errors;
// 	},
// 	onSubmit(values, form, callback) {
// 		const state = form.getState();
// 		if (state.dirty) {
// 			console.log("dirty :: ", state);
// 			return;
// 		}
// 		console.log("submitted :: ", values);
// 		// form.reset();
// 		// form.restart();
// 	},
// 	validateOnBlur: true,
// 	// mutators: {
// 	// 	email: (value) => {
// 	// 		console.log("mutate email :: ", value);
// 	// 		return value;
// 	// 	},
// 	// },
// });
// form.subscribe(
// 	(fields) => {
// 		form.resumeValidation();
// 	},
// 	{ values: true },
// );

// for (const key in fields) {
// 	const field = fields[key];
// 	form.registerField(
// 		key,
// 		(ff) => {
// 			// console.log("value changed ", key, " :: ", ff.value);
// 			const validator = (field as any)?.validate;
// 			if (typeof validator === "function") {
// 				const errors = { ...state.get().errors };
// 				const error = validator(ff.value);
// 				console.log("error occured :: ", error);
// 				if (error) {
// 					// const state = form.getState();
// 					// ff.error = error;
// 					// ff.invalid = true;
// 					// ff.valid = false;
// 					errors[key] = error;
// 					// state.errors = errors;
// 				} else if (key in errors) {
// 					// ff.error = null;
// 					delete errors[key];
// 				}
// 				state.set({ errors });
// 			}
// 		},
// 		{
// 			value: true,
// 			active: true,
// 			error: true,
// 			invalid: true,
// 			touched: true,
// 			valid: true,
// 			visited: true,
// 			dirty: true,
// 		},
// 		{},
// 	);
// }
