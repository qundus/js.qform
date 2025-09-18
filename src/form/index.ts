import type { Form } from "../_model";
import { PLACEHOLDERS } from "../const";

// checks
import { checkFormBasics } from "./checks/check-form-basics";

// addons
import { submitAddon } from "../addons/submit";
import { updateAddon } from "../addons/update";
import { valuesAddon } from "../addons/values";
import { buttonAddon } from "../addons/button";

// form
import { formAtoms } from "./atoms";
import { formFields } from "./fields";
import { formStore } from "./store";
import { setupOptionsMerger } from "../methods/setup-options-merger";
import { prepareOptions } from "./preparations/options";

export function form<B extends Form.Basics, F extends Form.Fields<B>, O extends Form.Options<F>>(
	basics: B,
	_options?: O,
): Form.Factory<F, O> {
	// checkFormBasics(basics);
	const options = prepareOptions<F, O>(_options) as O;
	const $store = formStore<F, O>(fields, options, form_init);
	// essentials
	const { fields, form_init } = formFields<B, F, O>(basics, options);
	const { atoms, elements } = formAtoms<F, O>(fields, options, $store);

	// addons (forced for now)
	const addonProps = { fields, options, $store };
	const submit = submitAddon<F, O>(addonProps);
	const update = updateAddon<F, O>(addonProps);
	const values = valuesAddon<F, O>(addonProps);
	const button = buttonAddon<F, O>(addonProps);

	// other helpers
	let keys = null as (keyof F)[] | null;
	return {
		// fields, // for tests only, not recommended to export
		store: $store,
		placeholders: PLACEHOLDERS,
		get keys() {
			return () => {
				if (keys == null) {
					keys = Object.keys(fields ?? {}) as unknown as typeof keys;
				}
				return keys as (keyof F)[];
			};
		},
		// atoms
		atoms,
		elements,
		// addons
		submit,
		update,
		values,
		button,
	};
}

export function formSetup<G extends Form.Options<any>>(base?: G) {
	const optionsMerger = setupOptionsMerger(base);
	return <B extends Form.Basics, F extends Form.Fields<B>, D extends Form.Options<F>>(
		basics: B,
		doptions?: D,
	) => {
		const options = optionsMerger<D>(doptions);
		return form<B, F, typeof options>(basics, options);
	};
}

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
