import type { _QSTATE } from "@qundus/qstate";
import type { fieldElement } from "./field/element";
import type { OptionHooksIn } from "@qundus/qstate/hooks";
import type { PLACEHOLDERS } from "./const";
import type { updateAddon, deriveAddon } from "@qundus/qstate/addons";
import type { formAtoms } from "./form/atoms";
import type { FormActionsExtender } from "./form/extenders/actions";
import type { FormButtonExtender } from "./form/extenders/button";

// export types
export type * from "./plugins/form-button";
export type * from "./preparations/field-atom";
export type * from "./preparations/form-atoms";
export type * from "./preparations/field-store";
export type * from "./preparations/form-store";

// checkers
export namespace Check {
	export type IsUnknown<T> = unknown extends T ? true : false;
	export type IsUndefined<T> = unknown extends T ? never : undefined extends T ? true : false;
	export type IsNull<T> = unknown extends T ? never : null extends T ? true : false;
	export type IsEmpty<T> = unknown extends T ? never : {} extends T ? true : false;
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

	// note: this affects many derivatives, plz keep same
	export type Value<T extends Type, D> = true extends
		| Check.IsUnknown<D>
		| Check.IsUndefined<D>
		| Check.IsNull<D>
		? T extends "select"
			? string[]
			: T extends "file"
				? FileList
				: T extends "checkbox"
					? boolean
					: T extends "radio"
						? string
						: T extends "tel"
							? number | string
							: string // default\fallback data type
		: D;

	/**
	 * sometimes some field types require additional information beyond the
	 * the standard field "value", this offers that through value processing
	 * and places it under FieldState or State
	 */
	export type Extras<T extends Type> = T extends "file"
		? {
				buffer: string | ArrayBuffer | null | undefined;
				file: File;
				placeholder: string;
				name: string;
			}[]
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
	export type Validate = (
		value: any,
		helpers: { $values: Form.StoreObject<any>["values"] },
	) => string | string[] | undefined | null;
	/**
	 * processor used in case of complex data values
	 * need to be extracted from field element and the basic
	 * element.value processor isn't accurate enough.
	 * some processors run when events like onfocus and onblur fire,
	 * this gives the chance to modify field state like required,
	 * disabled..etc, according to specific needs or logic.
	 */
	export type Processor<F extends Options, Returns> = (
		props: FunctionProps.FieldProcessor<F>,
	) => Returns;
	export type ElementProcessor<D extends Element.DomType = Element.DomType> = (props: {
		key: string;
		// element: ElementSelectReturns<D> | ElementInputReturns<D>;
		element: Record<string, any>; // very tough getting the proper types here while allowing freedom of key assignment
		value: Field.StoreObject<any>;
		isVdom: D extends "vdom" ? true : false;
		kType: Element.KeysType;
	}) => void;
	// ) => ElementSelectReturns<D> | ElementInputReturns<D> ;
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
	// export type FieldOptions =
	// 	// | { label: string; value: string }[]
	// 	(<G>(props?: G) => { label: string; value: string }[]) | null | undefined;

	// DON'T CHANGE TEMPLATES, IF CHANGED CHECK EVERY FIELD ATTRIBUTES
	export type Options<T extends Type = Type, V = any> = {
		// T extends FieldType = FieldType
		type: T;
		/** initial value */
		value?: V;
		hidden?: boolean;
		label?: string;
		// keep any for sub types that use Field to avoid type issues in outer projects
		processValue?: Processor<Options<any>, any> | Processor<Options<any>, any>[];
		/** validate value */
		validate?: Validate | Validate[] | null; //| FieldValidate[];
		validateOn?: ValidateOn;
		processCondition?: Processor<Options<any>, void>;
		onChange?: (props: {
			$value: Field.StoreObject<Options<any>>;
			form: Form.StoreObject<Form.Fields>;
		}) => void;
		required?: boolean;
		disabled?: boolean;
		//
		/** supercedes global options */
		vmcm?: VMCM;
		/**
		 * html bare element props passed, this is so preliminary right
		 * now and requires extra work for vdom, expect breaking changes here.
		 */
		processElement?: ElementProcessor;
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
		//
		// options?: T extends "select" | "radio" ? FieldOptions : null;
		multiple?: T extends "select" ? boolean : false;
		/**
		 * for when a checkbox is mandatory daah
		 */
		mandatory?: T extends "checkbox" ? boolean : false;
	};
	// extends infer G
	// 	? { [K in keyof G as G[K] extends never ? never : K]: G[K] }
	// 	: never;

	// store
	export type StoreObject<F extends Options> = {
		value: F["value"] | undefined;
		condition: Field.Condition;
		errors?: string[];
		extras?: Field.Extras<F["type"]>;
	};
	export type Store<F extends Options, O extends Form.Options<any>> = _QSTATE.StoreDerived<
		Field.StoreObject<F>,
		{ hooks: O["hooks"] }
	>;

	// element
	export type Element<F extends Options, O extends Options<any>> = ReturnType<
		typeof fieldElement<F, O>
	>;

	// atom
	export type Atom<F extends Options, O extends Form.Options<any>> = F extends Options<
		infer type,
		infer value
	>
		? {
				$store: Store<F, O>;
				key: string;
				type: type;
				label: string;
				// getOptions?: F["options"];
				get element(): Element<F, O>;
				placeholders: typeof PLACEHOLDERS;
				get addValidation(): (func: Field.Validate) => (() => void) | null;
				updateValue: (
					value: value | ((prev: value) => void),
					configs?: { preprocessValue?: boolean },
				) => void;
				clearValue: () => void;
				updateCondition: (
					value:
						| Partial<Field.Condition>
						| ((prev: Partial<Field.Condition>) => Partial<Field.Condition>),
				) => void;
			}
		: unknown;
}

export namespace Form {
	// basics
	export type Basic = null | undefined | Field.Options | Field.Type;
	// export type BasicOptional = null | undefined | Partial<Field> | FieldType;
	export type Basics = Record<string, Basic>;

	// converters
	// note: this affects many derivatives, plz keep same
	// note: this is connected to FieldValue above, plz keep same
	export type BasicToField<T extends Basic> = true extends
		| Check.IsUnknown<T>
		| Check.IsUndefined<T>
		| Check.IsNull<T>
		| Check.IsEmpty<T>
		? Field.Options<Field.Type, string> // if caused issues change to FieldType
		: T extends Field.Type
			? Field.Options<T, Field.Value<T, undefined>> // when basic is a field type
			: T extends Field.Options
				? Field.Options<T["type"], Field.Value<T["type"], T["value"]>>
				: never;
	export type Fields<B extends Basics = Basics> = {
		[K in keyof B]: BasicToField<B[K]>;
	} extends infer G
		? { [K in keyof G]: G[K] }
		: never;

	//

	// form
	export type Status = "idle" | "incomplete" | "error" | "valid" | "submit";
	export type Values<T extends Fields> = {
		[K in keyof T]: T[K]["value"];
	};
	export type Errors<T extends Fields> =
		| undefined
		| null
		| {
				[K in keyof T]?: string[];
		  };
	export type Conditions<T extends Fields> = {
		[K in keyof T]: Field.Condition;
	};
	export type Extras<T extends Fields> = {
		[K in keyof T as Field.Extras<T[K]["type"]> extends never ? never : K]: Field.Extras<
			T[K]["type"]
		>;
	};

	// creator options
	export type Options<F extends Fields> = {
		//
		hooks?: OptionHooksIn;
		onMount?: (props: {
			init: StoreObject<F>;
			update: (values: any) => void | Promise<void>;
		}) => Promise<void> | void;
		onChange?: (props: { newValue: StoreObject<F>; abort: () => void }) => void;
		vmcm?: Field.VMCM;
		/**
		 * usually all values are immediatly updated in the state,
		 * by setting this to true, only valid values will be commited.
		 * @default false
		 */
		preventErroredValues?: boolean;
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
		/**
		 * global options to optin or out of values preprocessing based on field type.
		 * this option precedes individual ones
		 */
		preprocessValues?: boolean;
		/**
		 * how should the form react to updating values using form.actions.update
		 * @default "silent"
		 */
		onUpdateKeyNotFound?: "silent" | "warn"; // | "error" | "errorWithProcessExit" // default to warn, add extra options here
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
		// /**
		//  * reflecting last form validity checks on the condition of
		//  * the field itself, this is benefitial when the form wanted
		//  * behavior is to highlight incomplete fields
		//  * @default false
		//  * @deprecated
		//  */
		// incompleteAffectsCondition?: boolean | "value"; //| "state";
		/**
		 * wheather the preferred method of checking values
		 * is ran oninput or onchange, oninput checks for validation
		 * for every change happens, onchange checks once there's a
		 * state change like blur or focus.
		 * field specific validateOn takes precedence here.
		 * @default input
		 */
		validateOn?: Field.ValidateOn;
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
	};
	export type OptionsMerged<G extends Options<any>, D extends Options<any>> = D & G;

	// store
	export type StoreObject<F extends Fields> = {
		values: Values<F>;
		conditions: Conditions<F>;
		errors: Errors<F>;
		extras: Extras<F>;
		incomplete: string[];
		status: Status;
	} extends infer G
		? { [K in keyof G]: G[K] }
		: never;
	export type StoreState<F extends Fields> = _QSTATE.NanoMap<StoreObject<F>>;
	export type Store<F extends Fields, O extends Options<any>> = _QSTATE.Store<
		StoreState<F>,
		{
			hooks: O["hooks"];
			addons: {
				derive: typeof deriveAddon;
				update: typeof updateAddon;
			};
		}
	>;

	// atoms
	export type Atoms<S extends Form.Fields, O extends Form.Options<S>> = {
		[K in keyof S]: Field.Atom<S[K], O>;
	};
	export type AtomsPrepared<S extends Fields, O extends Options<S>> = ReturnType<
		typeof formAtoms<S, O>
	>;

	// extenders
	export type ExtenderProps<F extends Form.Fields, O extends Form.Options<F>> = {
		fields: F;
		options: O;
		$store: Form.Store<F, O>;
	};

	// factory/result
	export type Factory<B extends Basics, F extends Fields<B>, O extends Options<F>> = AtomsPrepared<
		F,
		O
	> & {
		actions: FormActionsExtender<F, O>;
		button: FormButtonExtender<F, O>;
		placeholders: typeof PLACEHOLDERS;
		get keys(): () => (keyof F)[];
		/**
		 * extreme low-level control of form, use setters with extreme care as this affects
		 * the core logic of the form, it's advised to not modify form atoms/elements
		 * directly but use form.actions or atom.<method-name>
		 */
		$store: Store<F, O>;
		// $store: _QSTATE.StoreDerived<FormObject<F>, { hooks: O["hooks"] }>;
		// $store: Pick<FormStore<F, O>, "get" | "derive" | "subscribe" | "listen">;
	};
}

// never inherit props, always make independant props
export namespace FunctionProps {
	export interface Basic<F extends Field.Options, O extends Form.Options<any>> {
		key: string;
		field: F;
		options: O;
		$store: Form.Store<any, O>;
	}

	export interface Interaction<F extends Field.Options, O extends Form.Options<any>> {
		event: Event | undefined | null;
		value: any; // S["value"];
		$form: Form.StoreObject<any>;
	}

	export interface Processor<
		F extends Field.Options,
		O extends Form.Options<any> = Form.Options<any>,
	> {
		manualUpdate?: boolean;
		preprocessValue?: boolean;
	}

	export interface FieldProcessor<
		F extends Field.Options,
		O extends Form.Options<any> = Form.Options<any>,
	> {
		event: Event | undefined | null;
		value: any; // S["value"];
		manualUpdate: boolean;
		getValueOf: (key: string) => any;
		getConditionOf: (key: string) => any;
		$condition: Field.Condition;
	}
}
