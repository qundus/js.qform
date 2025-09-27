import type * as _QSTATE from "@qundus/qstate";
import type { PLACEHOLDERS, IGNORED_SETUP_KEYS, FIELD_CYCLES } from "./const";
import type { deriveAddon, hooksInUseAddon } from "@qundus/qstate/addons";
import type { JSX as PJSX } from "preact";

// checkers
export namespace Check {
	export type IsUnknown<T> = unknown extends T ? true : false;
	export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false;
	export type IsNull<T> = Exclude<T, null> extends never ? true : false;
	export type IsEmpty<T> = {} extends T ? true : false;
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
		readonly focused: boolean;
		readonly visited: boolean;
		readonly entered: boolean;
		readonly left: boolean;
		selections?: S["selections"];
	} & {
		[K in keyof Setup as K extends keyof typeof IGNORED_SETUP_KEYS | "selection"
			? never
			: K]: S[K] extends
			| Check.IsUnknown<S[K]>
			| Check.IsUndefined<S[K]>
			| Check.IsNull<S[K]>
			| Check.IsEmpty<S[K]>
			? Setup[K]
			: S[K];
	};
	export type Errors = string[] | null | undefined;
	export type Validate = (props: {
		value: any;
		prev: any;
		form: Form.StoreObject<Form.Fields, Form.Options> | undefined;
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
		form: Form.StoreObject<any, any> | undefined;
		mark: Addon.FieldMark<Setup, Form.Options>;
		// prevForm: Form.StoreObject<Form.Fields>;
	}) => void | Promise<void>;
	export type OnRender<T extends Type> = (
		props: {
			key: string;
			attrType: Render.Attributes.Type;
			data: StoreObject<any>;
			// attrs: undefined;
		} /** this is the final attributes passed to the element */ & (
			| {
					attrFor: "input";
					attrs: Render.Attributes.Input<Setup<T>, Form.Options, Render.Attributes.Type>;
			  }
			| {
					attrFor: "trigger";
					attrs: Render.Attributes.Trigger<Setup<T>, Form.Options, Render.Attributes.Type>;
			  }
			| {
					attrFor: "option";
					attrs: Render.Attributes.Option<Setup<T>, Form.Options, Render.Attributes.Type>;
			  }
		),
	) => void;
	// select/radio
	export type Selections =
		| string[]
		| number[]
		| Record<string, unknown>[]
		| { label: string; value: string }[];

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
		onRender?: OnRender<T>;

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

		//## passables
		/** coming soon, a way to defing nested field fields */
		nested?: any;
		props?: Record<string, any>;

		//## type specific
		// selections/options for select and radio
		selections?: T extends "select" | "radio" ? Selections : null;
		selectionsValueKey?: T extends "select" | "radio" ? string | string[] : null;
		selectionsLabelKey?: T extends "select" | "radio" ? string | string[] : null;
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
	export type StoreUpdateSignal =
		| undefined
		| "internal.extras"
		| "value"
		| "element"
		| "element.focus"
		| "element.blur"
		| "element.click"
		| "element.click.trigger"
		| "element.click.option"
		| "cycle"
		| "props";
	export type StoreObject<S extends Setup> = {
		readonly __key: string;
		readonly __internal: {
			readonly update: StoreUpdateSignal;
			readonly manual: boolean;
			readonly event: Event | undefined;
			readonly preprocess?: boolean;
		};
		readonly cycle: keyof typeof FIELD_CYCLES;
		// user
		value: S["value"] | undefined;
		condition: Condition;
		element: Element<S>;
		/** user defined data */
		props: S["props"];
		errors?: string[];
		extras?: Field.Extras<S>;
	};
	export type StoreState<S extends Setup> = _QSTATE.Nano.Atom<StoreObject<S>>;
	export type Store<S extends Setup, O extends Form.Options> = _QSTATE.Store.Factory<
		StoreState<S>,
		{
			hooks: O["storeHooks"];
			addons: {
				hooksUsed: typeof hooksInUseAddon;
			};
		}
	>;

	// factory
	export type Factory<S extends Setup, O extends Form.Options> = {
		readonly key: string;
		readonly setup: S;
		readonly store: Omit<Store<S, O>, "set" | "setKey">; //Store<S, O>;
		// readonly render: ReturnType<typeof createElement<S, O>>;
		readonly render: {
			dom: Integration.FactoryOut<S, O, IntegrationDom<S, O>>["render"];
			ref: Integration.FactoryOut<S, O, IntegrationRef<S, O>>["render"];
			preact: Integration.FactoryOut<S, O, IntegrationPreact<S, O>>["render"];
			react: Integration.FactoryOut<S, O, IntegrationReact<S, O>>["render"];
			solid: Integration.FactoryOut<S, O, IntegrationSolid<S, O>>["render"];
			svelte: Integration.FactoryOut<S, O, IntegrationSvelte<S, O>>["render"];
		};
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

		//## passables
		/** store and pass any data around */
		props?: Record<string, any>;
		/**
		 * how's the props passed/merged with field's specific props.
		 * @option 'none' each props is kept independantly
		 * @option 'form-override' global form props trumps/overrides field's props
		 * @option 'field-override' field specific props trumps/overrides form's props
		 * @default 'none'
		 */
		propsMergeStrategy?: "none" | "form-override" | "field-override";

		//## store
		storeHooks?: _QSTATE.Option.Hooks.In<any>;
		onMount?: (props: {
			readonly isServerSide: () => boolean;
			readonly form: StoreObject<F, Options<F>>;
			readonly prev: StoreObject<F, Options<F>>;
			readonly getForm: () => StoreObject<F, Options<F>>;
			readonly fields: F;
			// readonly update: Addon.FormUpdate<F, Options<F>>;
		}) => void | Promise<void>;
		onEffect?: (props: {
			readonly isServerSide: () => boolean;
			readonly form: StoreObject<F, Options<F>>;
			readonly prev: StoreObject<F, Options<F>>;
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
		onFieldRender?: Field.OnRender<Field.Type>;
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
	export interface StoreObject<F extends Fields, O extends Options<F>>
		extends _QSTATE.NanoType.DeepMapObject {
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
		props: O["props"];
		incomplete: string[];
		status: Status;
		// changed: undefined | { root: keyof StoreObject<F>; key?: keyof F; value: any };
	}
	export type StoreState<F extends Fields, O extends Options<F>> = _QSTATE.Nano.Map<
		StoreObject<F, O>
	>;
	export type Store<F extends Fields, O extends Options<F>> = _QSTATE.Store.Factory<
		StoreState<F, O>,
		{
			hooks: O["storeHooks"];
			addons: {
				derive: typeof deriveAddon;
				// update: typeof updateAddon;
			};
		}
	>;

	// factory/result
	export type Factory<I extends FieldsIn, F extends Fields<I>, O extends Options<F>> = {
		/**
		 * extreme low-level control of form, use setters with extreme care as this affects
		 * the core logic of the form, it's advised to not modify form atoms/elements
		 * directly but use form.actions or atom.<method-name>
		 */
		readonly store: Store<F, O>;
		readonly fields: Fields<I, O>;
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

	// render
	export type RenderAttributes<
		S extends Field.Setup,
		O extends Form.Options,
		A extends Render.Attributes.Type,
	> = {
		attrType: A;
		reactive: Field.StoreObject<S>;
	};
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

//
import type { IntegrationDom } from "./integrations/dom";
import type { IntegrationRef } from "./integrations/ref";
import type { IntegrationPreact } from "./integrations/preact";
import type { IntegrationReact } from "./integrations/react";
import type { IntegrationSolid } from "./integrations/solid";
import type { IntegrationSvelte } from "./integrations/svelte";
export namespace Render {
	export namespace Attributes {
		// /**
		//  * when element props is accessed, usually the returned keys are
		//  * all that support for html element, this gives user the option
		//  * to choose which ones are wanted.
		//  * @default "all";
		//  */
		// export type Keys = "base" | "dedicated" | "all";
		export type Type = "dom" | "vdom";

		type ToDom<T extends Record<string, unknown>> = {
			[K in keyof T as `${Lowercase<K & string>}`]: T[K];
		};

		// input
		export type InputDom = ToDom<InputVdom>;
		export type InputVdom = {
			id: string;
			required: boolean;
			disabled: boolean;
			autoComplete: "on" | "off";
			type: string; // not linking to Field.Type to avoid issues with html.input.type
			name: string;
			multiple: boolean;
			value: any;
			onInput: (event: Event) => void;
			onChange: (event: Event) => void;
			onFocus: (event: FocusEvent) => void;
			onBlur: (event: FocusEvent) => void;
		};
		export type Input<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? InputDom : InputVdom) & Record<string, unknown>;

		// select
		export type TriggerDom = ToDom<TriggerVdom>;
		export type TriggerVdom = {
			name: string;
			value: any;
			onClick: (event: Event) => void;
		};
		export type Trigger<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? TriggerDom : TriggerVdom) & Record<string, unknown>;

		// option
		export type OptionDom = ToDom<OptionVdom>;
		export type OptionVdom = {
			value: any;
			selected: boolean;
			onClick: (event: Event) => void;
		};
		export type Option<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? OptionDom : OptionVdom) & Record<string, unknown>;

		// all
		export type AllInputDom = HTMLInputElement;
		export type AllInputVdom = PJSX.IntrinsicElements["input"];

		// factory
		export type Factory<R> = R;
	}

	export namespace Element {
		// export type Factory<
		// 	S extends Field.Setup,
		// 	O extends Form.Options,
		// 	A extends Attributes.Type,
		// > =
		// S["type"] extends "select"
		// 	? Select<S, O, A, boolean>
		// 	: S["type"] extends "radio"
		// 		? Radio<S, O, A, boolean>
		// 		: Input<S, O, A>;
	}
}

export namespace Integration {
	export type Template<S extends Field.Setup, O extends Form.Options> = {
		render: {
			input:
				| Render.Attributes.Input<S, O, Render.Attributes.Type>
				| ((...args: any[]) => Render.Attributes.Input<S, O, Render.Attributes.Type> | void);
			select: {
				trigger:
					| Render.Attributes.Trigger<S, O, Render.Attributes.Type>
					| ((...args: any[]) => Render.Attributes.Trigger<S, O, Render.Attributes.Type> | void);
				option: (
					...args: [value: any, ...any[]]
				) => Render.Attributes.Option<S, O, Render.Attributes.Type> | void;
			};
			radio: {
				option: (
					...args: [value: any, ...any[]]
				) => Render.Attributes.Option<S, O, Render.Attributes.Type> | void;
			};
		};
	};
	export type Factory<S extends Field.Setup, O extends Form.Options, T extends Template<S, O>> = T;

	export type FactoryOut<
		S extends Field.Setup,
		O extends Form.Options,
		F extends Factory<S, O, Template<S, O>>,
	> = {
		readonly render: "select" extends S["type"]
			? F["render"]["select"]
			: "radio" extends S["type"]
				? F["render"]["radio"]
				: F["render"]["input"];
	};
}
