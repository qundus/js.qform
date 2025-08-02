import type { _QSTATE } from "@qundus/qstate";
import type { Basics, Fields, FormObject, FormStore, Options, OptionsMerged } from "../_model";
// checks
import checkBasics from "../checks/check-basics";
import checkOptions from "../checks/check-options";
import { PLACEHOLDERS } from "../const";
import mergeOptions from "../methods/merge-options";
// methods
import formActions, { type FormActions } from "../plugins/form-actions";
import formButton, { type FormButton } from "../plugins/form-button";
import prepareFormAtoms, { type AtomsPrepared } from "../preparations/form-atoms";
// preparations
import prepareFormFields from "../preparations/form-fields";
import prepareFormStore from "../preparations/form-store";

export type Form<B extends Basics, F extends Fields<B>, O extends Options<F>> = AtomsPrepared<
	F,
	O
> & {
	actions: FormActions<F, O>;
	button: FormButton<F, O>;
	placeholders: typeof PLACEHOLDERS;
	get keys(): () => (keyof F)[];
	$store: _QSTATE.StoreDerived<FormObject<F>, { hooks: O["hooks"] }>;
	// $store: Pick<FormStore<F, O>, "get" | "derive" | "subscribe" | "listen">;
};

export function form<B extends Basics, F extends Fields<B>, O extends Options<F>>(
	basics: B,
	_options?: O,
): Form<B, F, O> {
	checkBasics(basics);
	const options = checkOptions<F, O>(_options) as O;
	// necessary preparations
	const { fields, form_init } = prepareFormFields<B, F, O>({ basics, options });
	const $store = prepareFormStore<F, O>({ fields, form_init, options });
	const { atoms, elements } = prepareFormAtoms<F, O>({ fields, options, $store });

	// plugins
	const actions = formActions<F, O>({ fields, options, $store });
	const button = formButton<F, O>({ fields, options, $store });

	// TODO: find a better solution for this if it affects performance
	const derived = $store.derive((value) => value);

	// other helpers
	let keys = null as (keyof F)[] | null;
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
					keys = Object.keys(fields ?? {}) as unknown as typeof keys;
				}
				return keys as (keyof F)[];
			};
		},
		$store: derived,
	};
}

export function formSetup<G extends Options<any>>(goptions?: G) {
	return <B extends Basics, F extends Fields<B>, D extends Options<F>>(basics: B, doptions?: D) => {
		const options = mergeOptions(goptions, doptions) as OptionsMerged<G, D>;
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
