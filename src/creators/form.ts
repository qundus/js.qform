import type { Basics, Fields, Options, Store } from "../_model";
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

export type CreateForm<
	B extends Basics,
	F extends Fields<B>,
	O extends Options<F, unknown>,
> = ReturnType<typeof prepareAtoms<F, O>> & {
	actions: ReturnType<typeof formActions<F, O>>;
	button: ReturnType<typeof formButton<F, O>>;
	placeholders: typeof PLACEHOLDERS;
	get keys(): () => (keyof F)[];
	$hooks: Store<F, O>["hooks"];
	$subscribe: Store<F, O>["subscribe"];
	$listen: Store<F, O>["listen"];
};
export default function createForm<
	B extends Basics,
	F extends Fields<B>,
	O extends Options<F, unknown>,
>(basics: B, _options?: O): CreateForm<B, F, O> {
	checkBasics(basics);
	const options = checkOptions<F, O>(_options);
	// necessary preparations
	const { fields, state_init } = prepareFields<B, F, O>({ basics, options });
	const $store = prepareState<F, O>({ fields, state_init, options });
	const { atoms, elements } = prepareAtoms<F, O>({ fields, options, $store });

	// plugins
	const actions = formActions<F, O>({ fields, options, $store });
	const button = formButton<F, O>({ fields, options, $store });

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
		// $store, // not a good decition considering how update channels are occuring!
		$hooks: $store.hooks,
		$subscribe: $store.subscribe,
		$listen: $store.listen,
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
