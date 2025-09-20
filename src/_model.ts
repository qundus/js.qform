import type { _QSTATE } from "@qundus/qstate";
import type { createElement } from "./field/elements";
import type { OptionHooksIn } from "@qundus/qstate/hooks";
import type { PLACEHOLDERS, IGNORED_SETUP_KEYS, FIELD_CYCLES } from "./const";
import type { deriveAddon } from "@qundus/qstate/addons";

// checkers
export namespace Check {
	export type IsUnknown<T> = unknown extends T ? true : false;
	export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false;
	export type IsNull<T> = Exclude<T, null> extends never ? true : false;
	export type IsEmpty<T> = {} extends T ? true : false;
}

export namespace Element {
	export type DomType = "dom" | "vdom";
	/**
	 * when element props is accessed, usually the returned keys are
	 * all that support for html element, this gives user the option
	 * to choose which ones are wanted.
	 * @default "all";
	 */
	export type KeysType = "base" | "special" | "all";

	export type Factory<T extends DomType, Base, Dom, VDom> = Base &
		("dom" extends T ? Dom : VDom) extends infer G
		? G
		: never;
}

export namespace Field {
	//
	// | unknown; //!! avoid use of unknown, messes up types, pay attention that this also affects InitField
	// | "button"
	// | "submit"
	export type Type =
		| "checkbox"
		| "color"
		| "date"
		| "datetime-local"
		| "email"
		| "file"
		// | "hidden" // replaced by hidden option
		| "image"
		| "month"
		| "number"
		| "password"
		| "radio"
		| "range"
		| "reset"
		| "search"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week"
		| "select";
	// | undefined;

	export type Condition = {
		valid: boolean;
		error: false | "validation" | "incomplete" | "optional";
		updated: boolean; // happens when value updated
		by: false | "user" | "manual"; // last modification by user or manual
	};
	export type Element<S extends Setup> = {
		[K in keyof Setup as K extends keyof typeof IGNORED_SETUP_KEYS ? never : K]: S[K] extends
			| Check.IsUnknown<S[K]>
			| Check.IsUndefined<S[K]>
			| Check.IsNull<S[K]>
			| Check.IsEmpty<S[K]>
			? Setup[K]
			: S[K];
	} & {
		readonly focused: boolean;
		readonly visited: boolean;
	};
	export type Errors = string[] | null | undefined;
	export type Validate = (props: {
		value: any;
		prev: any;
		form: Form.StoreObject<Form.Fields> | undefined;
	}) => string | string[] | undefined | null | void;
	/**
	 * Value Manual Change Mechanism (VMCM), happens when values are updated from api
	 * fetch data or just manual programmatic interferrence.
	 * this affects whether the updated values go through the proper
	 * channels of validation, proccessing and affects on form status or just
	 * updates values without affecting anything else.
	 * @option normal: value updates go through the proper channeels of validation, proccessing, error handling and condition report.
	 * @option bypass: value updates are not validated so no proccessing or error handling, condition is changed though.
	 * @option force-valid: value updates defaults fields value condition to valid.
	 * @default "normal"
	 */
	export type VMCM = "normal" | "bypass" | "force-valid";
	export type ValidateOn = "input" | "change";
	export type Selections =
		| string[]
		| number[]
		| Record<string, unknown>[]
		| { label: string; value: string }[];

	// events
	export type OnMount<T extends Type, V> = (props: {
		setup: Setup;
		update: Addon.FieldUpdate<Setup, Form.Options>;
		mark: Addon.FieldMark<Setup, Form.Options>;
	}) => void | (() => void) | Promise<void | (() => void)>;
	export type OnChange<T extends Type, V> = (props: {
		$next: StoreObject<Setup>;
		prev: StoreObject<Setup>;
		setup: Setup;
		form: Form.StoreObject<any> | undefined;
		mark: Addon.FieldMark<Setup, Form.Options>;
		// prevForm: Form.StoreObject<Form.Fields>;
	}) => void | Promise<void>;
	export type OnElement = <D extends Element.DomType = Element.DomType>(props: {
		key: string;
		// element: ElementSelectReturns<D> | ElementInputReturns<D>;
		/** this is the final props passed to the element */
		render: Record<string, any>; // very tough getting the proper types here while allowing freedom of key assignment
		state: StoreObject<any>;
		/** low-level control over the final store, only allowed here. */
		store: Store<any, any>;
		isVdom: D extends "vdom" ? true : false;
		kType: Element.KeysType;
	}) => void;

	// DON'T CHANGE TEMPLATES, IF CHANGED CHECK EVERY FIELD ATTRIBUTES
	export type Setup<
		T extends Type = Type,
		V = any,
		// S extends Selections | undefined = Selections | undefined,
	> = {
		//## essentials
		type: T;
		/** initial value */
		value?: V; //| ValueFromType<T>;
		label?: string;
		/**
		 * when labels are taken from key because they're null, this replaces
		 * certain chars like '_' or '-' with ' '
		 */
		labelReplace?: string | string[];
		//## validations
		/** validate value function or array of functions */
		validate?: Validate | Validate[] | null; //| FieldValidate[];
		validateOn?: ValidateOn;
		//## events
		onMount?: OnMount<T, V>;
		/**
		 * event used in case of complex data values
		 * need to be extracted from field element and the basic
		 * element.value event isn't accurate enough.
		 * some processors run when events like onfocus and onblur fire,
		 * this gives the chance to modify field state like required,
		 * disabled..etc, according to specific needs or logic.
		 */
		onChange?: OnChange<T, V> | OnChange<T, V>[];
		/**
		 * html bare element props passed, this is so preliminary right
		 * now and requires extra work for vdom, expect breaking changes here.
		 */
		onElement?: OnElement;

		//## conditions
		hidden?: boolean;
		required?: boolean;
		disabled?: boolean;

		//## value effects
		/** supercedes global options */
		vmcm?: VMCM;
		/**
		 * all values go through preprocessing phase, use this to prevent that
		 * @default true
		 */
		preprocessValue?: boolean;
		/**
		 * checks for missing/required value and mark condition.error as
		 * incomplete.
		 * @default true
		 */
		incompleteStatus?: boolean;
		/**
		 * allowing the field value to be null
		 */
		valueNullable?: boolean;

		//## state effects
		/**
		 * abort state changes when an exception is thrown from onChange
		 * method or not
		 * @default false
		 */
		onChangeException?: boolean;

		//## type specific
		selections?: T extends "select" | "radio" ? Selections : null;
		multiple?: T extends "select" ? boolean : false;
		/**
		 * for when a checkbox is mandatory daah
		 */
		mandatory?: T extends "checkbox" ? boolean : false;
	};
	// extends infer G
	// 	? { [K in keyof G as G[K] extends never ? never : K]: G[K] }
	// 	: never;

	// converters
	export type ValueFromType<T extends Type> = T extends "select"
		? string[]
		: T extends "file"
			? // TODO: figure out how to display this in options but hide it from final object value type
				FileList // | string | string[] | {name: string; url: string;} | {name: string; url:string}[]
			: T extends "checkbox"
				? boolean
				: T extends "radio"
					? string
					: T extends "tel"
						? number | string
						: string; // default/fallback data type
	export type ValueFromOptions<T extends Type, V, Required, Hidden> = (
		true extends Check.IsUnknown<V> | Check.IsUndefined<V> | Check.IsNull<V>
			? // if value is not set then fallback to original input type value
				{ value: ValueFromType<T> }
			: // control final recieved types, for example file type input is strictly set to FileList
				{ value: "file" extends T ? ValueFromType<T> : V }
	) extends infer G
		? {
				[K in keyof G]: Required extends false
					? G[K] | undefined
					: Hidden extends true
						? G[K] | undefined
						: G[K];
			}
		: never;
	export type SetupIn = Type | Setup | null | undefined;
	export type SetupInToSetup<S extends SetupIn> = S extends Setup<infer type, infer value>
		? ValueFromOptions<type, value, S["required"], S["hidden"]> & Omit<S, "value">
		: S extends Type
			? ValueFromOptions<S, undefined, true, false> & Omit<Field.Setup<S>, "value"> // when basic is a field type
			: ValueFromOptions<Type, string, true, false> & Omit<Setup<Type, string>, "value">; // if caused issues change to FieldType

	// extras
	/**
	 * sometimes some field types require additional information beyond the
	 * the standard field "value", this offers that through value processing
	 * and places it under FieldState or State
	 */
	export type Extras<S extends Setup<Type>, T = S["type"]> =
		| (T extends "file"
				? {
						files: {
							file: File;
							name: string;
							loading: boolean;
							stage: "start" | "success" | "fail" | "abort";
							progress: {
								loadedBytes: number;
								totalBytes: number;
								percentage: number;
							};
							buffer?: string | ArrayBuffer | null;
							url?: string;
							error?: DOMException | null;
						}[];
						count: {
							upload: number;
							failed: number;
							done: number;
						};
						fallback?: { name: string; url: string }[];
					}
				: never)
		| undefined;

	// store
	export type StoreObject<S extends Setup> = {
		readonly __key: string;
		readonly __internal: {
			readonly update:
				| undefined
				| "value"
				| "extras"
				| "element"
				| "element.focus"
				| "element.blur"
				| "cycle";
			readonly manual: boolean;
			readonly event: Event | undefined;
			readonly preprocess?: boolean;
		};
		readonly cycle: keyof typeof FIELD_CYCLES;
		// user
		value: S["value"] | undefined;
		condition: Condition;
		element: Element<S>;
		errors?: string[];
		extras?: Field.Extras<S>;
	};
	export type StoreState<S extends Setup> = _QSTATE.NanoAtom<StoreObject<S>>;
	export type Store<S extends Setup, O extends Form.Options> = _QSTATE.Store<
		StoreState<S>,
		{ hooks: O["storeHooks"] }
	>;

	// factory
	export type Factory<S extends Setup, O extends Form.Options> = {
		readonly key: string;
		readonly setup: S;
		readonly store: Omit<Store<S, O>, "set" | "setKey">; //Store<S, O>;
		readonly render: ReturnType<typeof createElement<S, O>>;
		readonly placeholders: typeof PLACEHOLDERS;
		// addons
		readonly add: Addon.FieldAdd<S, O>;
		readonly clear: Addon.FieldClear<S, O>;
		readonly update: Addon.FieldUpdate<S, O>;
		readonly mark: Addon.FieldMark<S, O>;
	};
}

export namespace Form {
	//
	export type Status = "mount" | "idle" | "incomplete" | "error" | "valid" | "submit";
	export type FieldsIn = Record<string, Field.SetupIn> | undefined | null;
	export type Fields<I extends FieldsIn = FieldsIn, O extends Options = Options> = I extends Record<
		string,
		Field.SetupIn
	>
		? {
				[K in keyof I]: Field.Factory<Field.SetupInToSetup<I[K]>, O>;
			}
		: Record<string, Field.Factory<Field.Setup, O>>;
	// extends infer G? {[K in keyof G]: G[K]} : never;

	// options
	export type Options<F extends Fields = any> = {
		//## value effects
		vmcm?: Field.VMCM;

		/**
		 * when labels are taken from key because they're null, this replaces
		 * certain chars like '_' or '-' with ' '
		 */
		labelReplace?: string | string[];

		/**
		 * global options to optin or out of values preprocessing based on field type.
		 * this option precedes individual ones
		 */
		preprocessValues?: boolean;

		/**
		 * usually all values are immediatly updated in the state,
		 * by setting this to true, only valid values will be commited.
		 * @default false
		 */
		preventErroredValues?: boolean;

		/**
		 * wheather the preferred method of checking values
		 * is ran oninput or onchange, oninput checks for validation
		 * for every change happens, onchange checks once there's a
		 * state change like blur or focus.
		 * field specific validateOn takes precedence here.
		 * @default input
		 */
		validateOn?: Field.ValidateOn;

		//## store
		storeHooks?: OptionHooksIn;
		onMount?: (props: {
			readonly isServerSide: () => boolean;
			readonly form: StoreObject<F>;
			readonly prev: StoreObject<F>;
			readonly getForm: () => StoreObject<F>;
			readonly fields: F;
			// readonly update: Addon.FormUpdate<F, Options<F>>;
		}) => void | Promise<void>;
		onEffect?: (props: {
			readonly isServerSide: () => boolean;
			readonly form: StoreObject<F>;
			readonly prev: StoreObject<F>;
			readonly fields: F;
			// readonly update: Addon.FormUpdate<F, Options<F>>;
		}) => void;
		/**
		 * abort state changes when an exception is thrown from onChange
		 * method or not
		 * @default false
		 */
		abortOnChangeException?: boolean;

		//## conditions
		/**
		 * normal behavior of form is to consider all fields required
		 * and mark optional ones through "require" setting,
		 * this alters that behavior and forces all fields to be optional.
		 * the user then has the ability to make required fields through
		 * setting "required" to true
		 * @default true
		 */
		allFieldsRequired?: boolean;
		allFieldsDisabled?: boolean;

		//## field events
		onFieldChange?: Field.OnChange<Field.Type, any>;
		/**
		 * global per element render listener, gets called before or after field's specific
		 * onElement based on onFieldElementOrder option.
		 */
		onFieldElement?: Field.OnElement;
		/**
		 * determines wheather global onFieldElement is going to take place before or after
		 * field's specific onFieldElementOrder
		 * @default "after"
		 */
		onFieldElementOrder?: "before" | "after";

		//## exportation and usage
		/**
		 * the last step of checking for form validity is to check for
		 * required fields' values and add them to the incompleteList,
		 * this option allows for choosing how big or small this list goes.
		 * @option true collect all incomplete fields
		 * @option false don't collect any incomplete fields
		 * @option number collect this many of incomplete fields
		 * @default false
		 */
		incompleteListCount?: boolean | number;
		/**
		 * how should the form react to updating values using form.actions.update
		 * @default "silent"
		 */
		onUpdateKeyNotFound?: "silent" | "warn"; // | "error" | "errorWithProcessExit" // default to warn, add extra options here
		/**
		 * if the desired data extracted from the form is in the
		 * shape of a nested object, then this splitter is used
		 * to determine which keys are nested, for now only
		 * the dot is supported.
		 * @default '.'
		 */
		flatObjectKeysChar?: ".";
		/**
		 * when no label is provided, the key is used as fallback but sometimes
		 * the key is meant to be unflattened later on when fetching the form data,
		 * so this offers a way to replace the key flatObjectKeysChar with any
		 * character.
		 * @default ' ' or empty spcace
		 */
		flatLabelJoinChar?: string;

		//## old ideas
		// /**
		//  * checks for missing/required fields results in condition.incomplete = true,
		//  * this option alters the behavior of the entire form state
		//  * @option "onsubmit": check for all missing/incomplete fields onsubmit, called when actions.canSubmit or actions.submit is used
		//  * @option "onblur": check for each particular field's value onblur, meaning after field input has been left
		//  * @option 'onanychange': check for incomplete fields on any change that occurs like: focus, blur, value change...etc
		//  * @option false: stop/don't check for incomplete fields;
		//  * @default 'onblur'
		//  * @deprecated
		//  */
		// incompleteBehavior?: boolean | "onsubmit" | "onanychange";
		// /**
		//  * reflecting last form validity checks on the condition of
		//  * the field itself, this is benefitial when the form wanted
		//  * behavior is to highlight incomplete fields
		//  * @default false
		//  * @deprecated
		//  */
		// incompleteAffectsCondition?: boolean | "value"; //| "state";
	};
	export type OptionsMerged<G extends Options, D extends Options> = D & G;

	// store
	export interface StoreObject<F extends Fields> extends _QSTATE.TypeDeepMapObject {
		values: {
			[K in keyof F]: F[K]["setup"]["value"];
		};
		elements: {
			[K in keyof F]: F[K]["store"]["value"]["element"];
		};
		conditions: {
			[K in keyof F]: Field.Condition;
		};
		errors: {
			[K in keyof F]?: string[];
		};
		extras: {
			[K in keyof F as Field.Extras<F[K]["setup"]> extends never ? never : K]: Field.Extras<
				F[K]["setup"]
			>;
		};
		incomplete: string[];
		status: Status;
		// changed: undefined | { root: keyof StoreObject<F>; key?: keyof F; value: any };
	}
	export type StoreState<F extends Fields> = _QSTATE.NanoMap<StoreObject<F>>;
	export type Store<F extends Fields, O extends Options<F>> = _QSTATE.Store<
		StoreState<F>,
		{
			hooks: O["storeHooks"];
			addons: {
				derive: typeof deriveAddon;
				// update: typeof updateAddon;
			};
		}
	>;

	// factory/result
	export type Factory<F extends Fields, O extends Options<F>> = {
		/**
		 * extreme low-level control of form, use setters with extreme care as this affects
		 * the core logic of the form, it's advised to not modify form atoms/elements
		 * directly but use form.actions or atom.<method-name>
		 */
		readonly store: Store<F, O>;
		readonly fields: F; //Fields<I, O>;
		readonly options: O;
		readonly placeholders: typeof PLACEHOLDERS;
		get keys(): () => (keyof F)[];

		// addons
		submit: Addon.FormSubmit<F, O>;
		update: Addon.FormUpdate<F, O>;
		values: Addon.FormValues<F, O>;
		button: Addon.FormButton<F, O>;
	};
}

// never inherit props, always make independant props
export namespace FunctionProps {
	// field
	export interface Field<S extends Field.Setup, O extends Form.Options> {
		key: string;
		setup: S;
		options: O | undefined;
		store: Field.Store<S, O>;
		init: Field.StoreObject<S>;
	}
	export type FieldCycle<S extends Field.Setup, O extends Form.Options> = Field<S, O>;
	export type FieldAddon<S extends Field.Setup, O extends Form.Options> = Field<S, O>;
	export interface FieldProcessor<S extends Field.Setup, O extends Form.Options> {
		value: any;
		event: Event | undefined;
		manualUpdate: boolean;
		preprocessValue: boolean;
		$next: Field.StoreObject<S>;
	}

	// form
	export type FormCycle<F extends Form.Fields, O extends Form.Options> = {
		fields: F;
		options: O;
		store: Form.Store<F, O>;
	};
	export type FormAddon<F extends Form.Fields, O extends Form.Options> = FormCycle<F, O>;
}

// addons/future-independant
import type { FieldAddonAdd } from "./addons/field/add";
import type { FieldAddonClear } from "./addons/field/clear";
import type { FieldAddonUpdate } from "./addons/field/update";
import type { FieldAddonMark } from "./addons/field/mark";

import type { FormAddonSubmit } from "./addons/form/submit";
import type { FormAddonUpdate } from "./addons/form/update";
import type { FormAddonValues } from "./addons/form/values";
import type { FormAddonButton } from "./addons/form/button";

export namespace Addon {
	// field
	export type FieldAdd<S extends Field.Setup, O extends Form.Options> = FieldAddonAdd<S, O>;
	export type FieldClear<S extends Field.Setup, O extends Form.Options> = FieldAddonClear<S, O>;
	export type FieldUpdate<S extends Field.Setup, O extends Form.Options> = FieldAddonUpdate<S, O>;
	export type FieldMark<S extends Field.Setup, O extends Form.Options> = FieldAddonMark<S, O>;

	// form
	export type FormSubmit<F extends Form.Fields, O extends Form.Options<F>> = FormAddonSubmit<F, O>;
	export type FormUpdate<F extends Form.Fields, O extends Form.Options<F>> = FormAddonUpdate<F, O>;
	export type FormValues<F extends Form.Fields, O extends Form.Options<F>> = FormAddonValues<F, O>;
	export type FormButton<F extends Form.Fields, O extends Form.Options<F>> = FormAddonButton<F, O>;
}
