import type { Basics, Fields, Options } from "../_model";
// checks
import checkBasics from "../checks/check-basics";
import checkOptions from "../checks/check-options";
import { PLACEHOLDERS } from "../const";
// methods
import formActions from "../plugins/form-actions";
import formButton from "../plugins/form-button";
import prepareAtoms from "../preparations/atoms";
// preparations
import prepareFields from "../preparations/fields";
import prepareState from "../preparations/state";

export default function createForm<B extends Basics, F extends Fields<B> = Fields<B>>(
	basics: B,
	_options?: Options<F>,
) {
	checkBasics(basics);
	const options = checkOptions(_options);
	// necessary preparations
	const { fields, state_init } = prepareFields({ basics, options });
	const { $state } = prepareState({ fields, state_init, options });
	const { atoms, elements } = prepareAtoms({ fields, options, $state });

	// plugins
	const actions = formActions({ fields, options, $state });
	const button = formButton({ fields, options, $state });

	// other helpers
	let keys = null as (keyof F)[];
	return {
		// fields, // for tests only, not recommended to export
		atoms,
		elements,
		actions,
		button,
		placeholders: PLACEHOLDERS,
		get keys() {
			return () => {
				if (keys == null) {
					keys = Object.keys(fields ?? {}) as typeof keys;
				}
				return keys;
			};
		},
		// $state, // not a good decition considering how update channels are occuring!
		$hooks: $state.hooks,
		$subscribe: $state.subscribe,
		$listen: $state.listen,
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
