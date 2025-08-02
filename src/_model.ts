import type { _QSTATE } from "@qundus/qstate";
import type createProcessors from "./processors";
import type { FieldStoreObject } from "./preparations/field-store";
import type { FormStore } from "./preparations/form-store";
// export types
export type * from "./plugins/form-button";
export type * from "./preparations/field-atom";
export type * from "./preparations/form-atoms";
export type * from "./preparations/field-store";
export type * from "./preparations/form-store";

// internal
export type _Processors<F extends Field, O extends Options<any>> = ReturnType<
	typeof createProcessors<F, O>
>;

// element
export type ElementDomType = "dom" | "vdom";
/**
 * when element props is accessed, usually the returned keys are
 * all that support for html element, this gives user the option
 * to choose which ones are wanted.
 * @default "all";
 */
export type ElementKeysType = "base" | "special" | "all";
export type ElementReturns<T extends ElementDomType, Base, Dom, VDom> = Base &
	("dom" extends T ? Dom : VDom) extends infer G
	? G
	: never;

//
// | unknown; //!! avoid use of unknown, messes up types, pay attention that this also affects InitField
// | "button"
// | "submit"
export type FieldType =
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
export type FieldValue<T extends FieldType, D> = D extends unknown | null | undefined
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
export type FieldExtras<T extends FieldType> = T extends "file"
	? {
			buffer: string | ArrayBuffer | null | undefined;
			file: File;
			placeholder: string;
			name: string;
		}[]
	: never;
export type FieldCondition = {
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
export type FieldErrors = string[] | null | undefined;
export type FieldValidate = (
	value: any,
	helpers: { $values: FormObject<any>["values"] },
) => string | string[] | undefined | null;
/**
 * processor used in case of complex data values
 * need to be extracted from field element and the basic
 * element.value processor isn't accurate enough.
 * some processors run when events like onfocus and onblur fire,
 * this gives the chance to modify field state like required,
 * disabled..etc, according to specific needs or logic.
 */
export type FieldProcess<F extends Field, Returns> = (
	props: Omit<ProcessorProps<F>, "$form"> & {
		value: any; //S["value"];
		getValueOf: (key: string) => any;
		getConditionOf: (key: string) => any;
		$condition: FieldCondition;
		processors: _Processors<F, Options<any>>;
	},
) => Returns;
export type FieldProcessElement<D extends ElementDomType = ElementDomType> = (props: {
	key: string;
	// element: ElementSelectReturns<D> | ElementInputReturns<D>;
	element: Record<string, any>; // very tough getting the proper types here while allowing freedom of key assignment
	value: FieldStoreObject<any>;
	isVdom: D extends "vdom" ? true : false;
	kType: ElementKeysType;
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
export type FieldVMCM = "normal" | "bypass" | "force-valid";
export type FieldValidateOn = "input" | "change";
export type FieldOptions =
	// | { label: string; value: string }[]
	(<G>(props?: G) => { label: string; value: string }[]) | null | undefined;

// DON'T CHANGE TEMPLATES, IF CHANGED CHECK EVERY FIELD ATTRIBUTES
export type Field<T extends FieldType = FieldType, V = any> = {
	// T extends FieldType = FieldType
	type: T;
	/** initial value */
	value?: FieldValue<T, V> | null;
	hidden?: boolean;
	label?: string;
	processValue?: FieldProcess<Field<T>, any> | FieldProcess<Field<T>, any>[];
	/** validate value */
	validate?: FieldValidate | FieldValidate[] | null; //| FieldValidate[];
	validateOn?: FieldValidateOn;
	processCondition?: FieldProcess<Field<T>, void>;
	onChange?: (props: { $value: FieldStoreObject<Field<T>>; form: FormObject<Fields> }) => void;
	required?: boolean;
	disabled?: boolean;
	//
	/** supercedes global options */
	vmcm?: FieldVMCM;
	/**
	 * html bare element props passed, this is so preliminary right
	 * now and requires extra work for vdom, expect breaking changes here.
	 */
	processElement?: FieldProcessElement;
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
	options?: T extends "select" | "radio" ? FieldOptions : null;
	multiple?: T extends "select" ? boolean : false;
	/**
	 * for when a checkbox is mandatory daah
	 */
	mandatory?: T extends "checkbox" ? boolean : false;
};
// extends infer G
// 	? { [K in keyof G as G[K] extends never ? never : K]: G[K] }
// 	: never;

// basics
export type Basic = null | undefined | Field | FieldType;
// export type BasicOptional = null | undefined | Partial<Field> | FieldType;
export type Basics = Record<string, Basic>;

// converters
export type BasicToField<T extends Basic> = T extends Field
	? Field<T["type"], FieldValue<T["type"], T["value"]>>
	: T extends FieldType
		? Field<T> // when basic is a field type
		: Field<"text", string>;
export type Fields<B extends Basics = Basics> = {
	[K in keyof B]: BasicToField<B[K]>;
};

// form
export type FormStatus = "idle" | "incomplete" | "error" | "valid" | "submit";
export type FormValues<T extends Fields> = {
	[K in keyof T]: T[K]["value"];
};
export type FormErrors<T extends Fields> =
	| undefined
	| null
	| {
			[K in keyof T]?: string[];
	  };
export type FormConditions<T extends Fields> = {
	[K in keyof T]: FieldCondition;
};
export type FormExtras<T extends Fields> = {
	[K in keyof T as FieldExtras<T[K]["type"]> extends never ? never : K]: FieldExtras<T[K]["type"]>;
};
export type FormObject<F extends Fields> = {
	values: FormValues<F>;
	conditions: FormConditions<F>;
	errors: FormErrors<F>;
	extras: FormExtras<F>;
	incomplete: string[];
	status: FormStatus;
} extends infer G
	? { [K in keyof G]: G[K] }
	: never;

// creator options
export type Options<F extends Fields> = {
	//
	hooks?: _QSTATE.OptionsHooks;
	// events?: _QSTATE.OptionsEvents;
	onMount?: (props: { init: FormObject<F>; update: (values: any) => void | Promise<void> }) => void;
	onChange?: (props: { newValue: FormObject<F>; abort: () => void }) => void;
	vmcm?: FieldVMCM;
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
	validateOn?: FieldValidateOn;
	/**
	 * global element processor, gets called before or after field's specific processElement
	 * based on processElementOrder option.
	 */
	processElement?: FieldProcessElement;
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

// internal props
export type InteractionProps<F extends Field, O extends Options<any>> = {
	key: string;
	field: F;
	options: O;
	event: Event | undefined | null;
	value: any; //S["value"];
	preprocessValue?: boolean;
	$form: FormObject<any>;
};
export type ProcessorProps<F extends Field, O extends Options<any> = Options<any>> = {
	key: string;
	field: F;
	event: Event | undefined | null;
	manualUpdate: boolean;
	$form: FormObject<any>;
};
export type PluginProps<F extends Fields, O extends Options<F>> = {
	fields: F;
	options: O;
	$store: FormStore<F, O>;
};
export type ElementProps<F extends Field, O extends Options<any>> = {
	key: string;
	field: F;
	options: O;
	$store: FormStore<any, O>;
};
