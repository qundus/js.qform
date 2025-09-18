import type { _QSTATE } from "@qundus/qstate";
import type { fieldElement } from "./field/element";
import type { OptionHooksIn } from "@qundus/qstate/hooks";
import type { PLACEHOLDERS } from "./const";
import type { updateAddon, deriveAddon } from "@qundus/qstate/addons";
import type { formAtoms } from "./form/atoms";
import type { AddonSubmit } from "./addons/submit";
import type { AddonUpdate } from "./addons/update";
import type { AddonValues } from "./addons/values";
import type { AddonButton } from "./addons/button";

// export types
export namespace Addons {
	export type Submit<F extends Form.Fields, O extends Form.Options<F>> = AddonSubmit<F, O>;
	export type Update<F extends Form.Fields, O extends Form.Options<F>> = AddonUpdate<F, O>;
	export type Values<F extends Form.Fields, O extends Form.Options<F>> = AddonValues<F, O>;
	export type Button<F extends Form.Fields, O extends Form.Options<F>> = AddonButton<F, O>;
}
// export type * from "./plugins/form-button";
// export type * from "./preparations/field-atom";
// export type * from "./preparations/form-atoms";
// export type * from "./preparations/field-store";
// export type * from "./preparations/form-store";

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
	export type ValueFromOptions<F extends Setup, V extends F["value"] = F["value"]> = (
		true extends Check.IsUnknown<V> | Check.IsUndefined<V> | Check.IsNull<V>
			? // if value is not set then fallback to original input type value
				{ value: ValueFromType<F["type"]> }
			: // control final recieved types, for example file type input is strictly set to FileList
				{ value: F["type"] extends "file" ? ValueFromType<F["type"]> : V }
	) extends infer G
		? {
				[K in keyof G]: F["required"] extends false
					? G[K] | undefined
					: F["hidden"] extends true
						? G[K] | undefined
						: G[K];
			}
		: never;

	export type Condition = {
		valid: boolean;
		hidden: boolean;
		value: {
			updated: boolean; // happens when value updated
			lastUpdate: false | "user" | "manual"; // last modification by user or manual
			error: false | "validation" | "incomplete" | "optional";
		};
		element: {
			state: false | "focus" | "blur";
			visited: boolean; // happens first onfocus
			disabled: boolean;
			required: boolean;
		};
	};
	export type Errors = string[] | null | undefined;
	export type Validate = (props: {
		value: any;
		prev: any;
		// form: Form.StoreObject<any>
	}) => string | string[] | undefined | null;
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

	// DON'T CHANGE TEMPLATES, IF CHANGED CHECK EVERY FIELD ATTRIBUTES
	export type Setup<
		T extends Type = Type,
		V = unknown,
		// S extends Selections | undefined = Selections | undefined,
	> = {
		//## essentials
		type: T;
		/** initial value */
		value?: V; //| ValueFromType<T>;
		label?: string;
		//## validations
		/** validate value function or array of functions */
		validate?: Validate | Validate[] | null; //| FieldValidate[];
		validateOn?: ValidateOn;
		//## processors
		/**
		 * processor used in case of complex data values
		 * need to be extracted from field element and the basic
		 * element.value processor isn't accurate enough.
		 * some processors run when events like onfocus and onblur fire,
		 * this gives the chance to modify field state like required,
		 * disabled..etc, according to specific needs or logic.
		 */
		processState?: (props: {
			$next: StoreObject<Setup>;
			prev: StoreObject<Setup>;
			// form: Form.StoreObject<Form.Fields>;
			// prevForm: Form.StoreObject<Form.Fields>;
		}) => void | StoreObject<Setup<T, V>> | Promise<void | StoreObject<Setup<T, V>>>;
		/**
		 * html bare element props passed, this is so preliminary right
		 * now and requires extra work for vdom, expect breaking changes here.
		 */
		processElement?: <D extends Element.DomType = Element.DomType>(props: {
			key: string;
			// element: ElementSelectReturns<D> | ElementInputReturns<D>;
			element: Record<string, any>; // very tough getting the proper types here while allowing freedom of key assignment
			value: Field.StoreObject<any>;
			isVdom: D extends "vdom" ? true : false;
			kType: Element.KeysType;
		}) => void;
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
		 * checks for missing/required value and mark condition.value.error as
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
		 * abort state changes when an exception is thrown from processState
		 * method or not
		 * @default false
		 */
		abortProcessStateException?: boolean;

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

	// extras
	/**
	 * sometimes some field types require additional information beyond the
	 * the standard field "value", this offers that through value processing
	 * and places it under FieldState or State
	 */
	export type Extras<F extends Setup<any>, T extends F["type"] = F["type"]> =
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
				: T extends "select" | "radio"
					? {
							selections: F["selections"];
							// valueKey: string;
						}
					: never)
		| undefined;

	// store
	export type StoreObject<F extends Setup> = {
		readonly __internal: {
			readonly update: undefined | "focus" | "blur" | "value";
			readonly manual: boolean;
			readonly event: Event | undefined;
			readonly preprocess?: boolean;
		};
		// user
		value: F["value"] | undefined;
		condition: Field.Condition;
		errors?: string[];
		extras?: Field.Extras<F, F["type"]>;
	};
	export type StoreState<S extends Setup> = _QSTATE.NanoAtom<StoreObject<S>>;
	export type Store<S extends Setup, O extends Form.Options<any>> = _QSTATE.Store<
		StoreState<S>,
		{ hooks: O["hooks"] }
	>;

	// element
	export type Element<F extends Setup, O extends Form.Options<any>> = ReturnType<
		typeof fieldElement<F, O>
	>;

	// atom
	export type FactoryIn = null | undefined | Setup | Type;
	export type FactoryInToSetup<F extends FactoryIn> = true extends
		| Check.IsUnknown<F>
		| Check.IsUndefined<F>
		| Check.IsNull<F>
		| Check.IsEmpty<F>
		? Field.ValueFromOptions<Field.Setup<Field.Type, string>, string> &
				Omit<Field.Setup<Field.Type, string>, "value"> // if caused issues change to FieldType
		: F extends Field.Type
			? Field.ValueFromOptions<Field.Setup<F, unknown>, unknown> &
					Omit<Field.Setup<F, unknown>, "value"> // when basic is a field type
			: F extends Field.Setup<infer _type, infer value>
				? Field.ValueFromOptions<F, value> & Omit<F, "value">
				: never;
	export type Factory<F extends Setup, O extends Form.Options<any>> = F extends Setup
		? {
				store: Store<F, O>;
				key: string;
				type: F["type"];
				label: string;
				// getSelections?: selections;
				placeholders: typeof PLACEHOLDERS;
				clearValue: () => void;
				element: Element<F, O>;
				addValidation(): (func: Field.Validate) => (() => void) | null;
				updateValue: (
					value: F["value"] | ((prev: F["value"]) => void),
					configs?: Pick<FunctionProps.Processor<F, O>, "preprocessValue">,
				) => void;
				updateCondition: (
					value:
						| Partial<Field.Condition>
						| ((prev: Partial<Field.Condition>) => Partial<Field.Condition>),
				) => void;
			}
		: unknown;
}

export namespace Form {
	// attributes
	export type Status = "idle" | "incomplete" | "error" | "valid" | "submit";
	export type Changed<T extends Fields> =
		| undefined
		| { root: keyof StoreObject<T>; key?: keyof T; value: any };
	export type Values<T extends Fields> = {
		[K in keyof T]: T[K]["value"];
	};
	export type Errors<T extends Fields> = {
		[K in keyof T]?: string[];
	};
	export type Conditions<T extends Fields> = {
		[K in keyof T]: Field.Condition;
	};
	export type Extras<T extends Fields> = {
		[K in keyof T as Field.Extras<T[K]> extends never ? never : K]: Field.Extras<T[K]>;
	};

	// basics

	// export type BasicOptional = null | undefined | Partial<Field> | FieldType;
	export type Basics = Record<string, Basic>;

	// converters
	// note: this affects many derivatives, plz keep same
	// note: this is connected to FieldValue above, plz keep same

	export type Fields<B extends Basics = Basics> = {
		[K in keyof B]: BasicToField<B[K]>;
	} extends infer G
		? { [K in keyof G]: G[K] }
		: never;

	// options
	export type Options<F extends Fields> = {
		//
		readonly __fieldsType?: F;

		//## value effects
		vmcm?: Field.VMCM;

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
		hooks?: OptionHooksIn;
		onMount?: (props: {
			form: StoreObject<F>;
			update: AddonUpdate<F, Options<F>>["update"];
			isServerSide: () => boolean;
		}) => Promise<void> | void;
		onChange?: (props: {
			$next: StoreObject<F>;
			abort: () => void;
			isServerSide: () => boolean;
			/**
			 * override all global and single options, useful for one logic flows
			 * that apply only in particular situations
			 */
			$options: {
				/**
				 * to trigger validation on demand.
				 * @default false
				 */
				validate?: boolean | (keyof F)[] | keyof F;
			};
			// update: AddonUpdate<F, Options<F>>["update"];
		}) => void | Promise<void>;
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

		//## processors
		/**
		 * global element processor, gets called before or after field's specific processElement
		 * based on processElementOrder option.
		 */
		processElement?: Field.ElementProcessor;
		/**
		 * determines wheather global processElement is going to take place before or after
		 * field's specific processElement
		 * @default "after"
		 */
		processElementOrder?: "before" | "after";

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
	export type OptionsMerged<G extends Options<any>, D extends Options<any>> = D & G;

	// store
	export interface StoreObject<F extends Fields> extends _QSTATE.TypeDeepMapObject {
		values: Values<F>;
		conditions: Conditions<F>;
		errors: Errors<F>;
		extras: Extras<F>;
		incomplete: string[];
		status: Status;
		changed: Changed<F>;
	}
	export type StoreState<F extends Fields> = _QSTATE.NanoDeepMap<StoreObject<F>>;
	export type Store<F extends Fields, O extends Options<any>> = _QSTATE.Store<
		StoreState<F>,
		{
			hooks: O["hooks"];
			addons: {
				derive: typeof deriveAddon;
				// update: typeof updateAddon;
			};
		}
	>;

	// actions
	// atoms
	// export type Atoms<F extends Form.Fields, O extends Form.Options<F>> = {
	// 	[K in keyof F]: Field.Atom<F[K], O>;
	// };
	// export type AtomsPrepared<F extends Fields, O extends Options<F>> = ReturnType<
	// 	typeof formAtoms<F, O>
	// >;

	// factory/result
	export type Factory<F extends Fields, O extends Options<F>> = {
		__fieldsType?: F; // for tests only, not recommended to export
		/**
		 * extreme low-level control of form, use setters with extreme care as this affects
		 * the core logic of the form, it's advised to not modify form atoms/elements
		 * directly but use form.actions or atom.<method-name>
		 */
		store: Store<F, O>;
		placeholders: typeof PLACEHOLDERS;
		get keys(): () => (keyof F)[];
	} & AtomsPrepared<F, O> &
		AddonSubmit<F, O> &
		AddonUpdate<F, O> &
		AddonValues<F, O> &
		AddonButton<F, O>;
}

// never inherit props, always make independant props
export namespace FunctionProps {
	export interface Element<S extends Field.Setup, O extends Form.Options<any>> {
		key: string;
		setup: S;
		options: O | undefined;
		store: Field.Store<S, O>;
	}

	export interface Interaction<F extends Field.Setup, O extends Form.Options<any>> {
		event: Event | undefined | null;
		value: any; // S["value"];
	}

	export interface Processor<
		F extends Field.Setup,
		O extends Form.Options<any> = Form.Options<any>,
	> {
		manualUpdate?: boolean;
		preprocessValue?: boolean;
	}

	//
	export interface FieldProcessor<
		F extends Field.Setup,
		FF extends Form.Fields = Form.Fields,
		// O extends Form.Options<FF> = Form.Options<FF>,
	> {
		setup: F;
		event: Event | undefined | null;
		manualUpdate: boolean;
		// form: Form.StoreObject<FF>;
		$next: {
			value: any; // S["value"];
			condition: Field.Condition;
		};
	}

	//
	export type Addon<F extends Form.Fields, O extends Form.Options<F>> = {
		setups: F;
		options: O;
		$store: Form.Store<F, O>;
	};
}
