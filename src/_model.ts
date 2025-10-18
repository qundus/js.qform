import type * as _QSTATE from "@qundus/qstate";
import type { IGNORED_SETUP_KEYS, FIELD, FORM, CALENDAR } from "./const";
import type { deriveAddon, hooksInUseAddon } from "@qundus/qstate/addons";
import type { JSX as PJSX } from "preact";

//
import type { FieldAddonUpdate } from "./addons/field/update";
import type { FieldAddonRemove } from "./addons/field/remove";
import type { FieldAddonReset } from "./addons/field/reset";

import type { FormAddonSubmit } from "./addons/form/submit";
import type { FormAddonUpdate } from "./addons/form/update";
import type { FormAddonValues } from "./addons/form/values";
import type { FormAddonButton } from "./addons/form/button";

import type { IntegrationDom } from "./integrations/dom";
import type { IntegrationRef } from "./integrations/ref";
import type { IntegrationPreact } from "./integrations/preact";
import type { IntegrationReact } from "./integrations/react";
import type { IntegrationSolid } from "./integrations/solid";
import type { IntegrationSvelte } from "./integrations/svelte";
import type { SelectedList } from "./render/helpers/date/selected-list";

// checkers
export namespace Check {
	export type IsUnknown<T> = unknown extends T ? true : false;
	export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false;
	export type IsNull<T> = Exclude<T, null> extends never ? true : false;
	export type IsEmpty<T> = {} extends T ? true : false;
	export type IsSetupOfType<S extends Field.Setup, T extends Field.Type> = S extends { type: T }
		? true
		: never;
}

export namespace Field {
	//
	// | unknown; //!! avoid use of unknown, messes up types, pay attention that this also affects InitField
	// | "button"
	// | "submit"
	export type Type =
		// | "hidden" // replaced by hidden option
		// | "datetime-local" // unnecessary complication, date setup configuration is more than enough
		| "checkbox"
		| "color"
		| "date"
		| "email"
		| "file"
		| "image"
		| "month"
		| "number"
		| "password"
		| "range"
		| "reset"
		| "search"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week"
		| "select"
		| "select.radio";
	// | "select.native" // coming soon: for native select elements
	// | "group" // coming soon: for collection of setups

	export type Condition = {
		valid: boolean;
		error: false | "validation" | "incomplete" | "optional";
		updated: boolean; // happens when value updated
		by: false | "user" | "manual"; // last modification by user or manual
	};
	export type Errors = string[] | null | undefined;
	export type Validate<T extends Type> = (props: {
		value: any;
		prev: any;
		readonly extras: Extras.Factory<Setup<T>>;
		readonly form: Form.StoreObject<Form.Fields, Form.Options> | undefined;
	}) => string | string[] | undefined | null | void;
	export type VMCM = "normal" | "bypass" | "force-valid";
	export type ValidateOn = "input" | "change";
	// events
	export type OnMount<T extends Type, V> = (props: {
		setup: Setup;
		update: Addon.FieldUpdate<Setup, Form.Options>;
		isServerSide: () => boolean;
	}) => void | (() => void) | Promise<void | (() => void)>;
	export type OnChange<T extends Type, V> = (props: {
		$next: StoreObject<Setup>;
		prev: StoreObject<Setup>;
		setup: Setup;
		form: Form.StoreObject<any, any> | undefined;
		update: Addon.FieldUpdate<Setup, Form.Options>;
		isServerSide: () => boolean;
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
					attrs: Render.Attributes.SelectTrigger<Setup<T>, Form.Options, Render.Attributes.Type>;
			  }
			| {
					attrFor: "option";
					attrs: Render.Attributes.SelectOption<Setup<T>, Form.Options, Render.Attributes.Type>;
			  }
		),
	) => void;
	export type Event = { value?: any; checked?: any; files?: FileList };

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
		placeholder?: string;
		label?: string;
		/**
		 * when labels are taken from key because they're null, this replaces
		 * certain chars like '_' or '-' with ' '
		 */
		labelReplace?: string | string[];
		//## validations
		/** validate value function or array of functions */
		validate?: Validate<T> | Validate<T>[] | null; //| FieldValidate[];
		/**
		 * some developers like to validate on field.blur and others on field.change.
		 * @option {change} run checks only on field.blur
		 * @option {input} run checks on everychange occurs
		 */
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
		/**
		 * can be used for when a field is mandatory, like a checkbox.
		 */
		mandatory?: boolean;
		/**
		 * usually the cycle starts with INIT then IDLE moving to whatever developer logic
		 * prefers to set through onMount function, this alters the MOUNT cycle allowing for any
		 * cycle to replace it.
		 * @default CYCLE.IDLE
		 */
		initCycle?: FIELD.CYCLE;

		//## value effects
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
		multiple?: boolean;

		//## type specific as extra
		// radio?: T extends "select.radio" ? RadioSetup : never;
		tel?: T extends "tel" ? Extras.Tel.In : never;
		select?: T extends "select" | "select.radio" ? Extras.Select.In : never;
		checkbox?: T extends "checkbox" ? Extras.Checkbox.In : never;
		date?: T extends "date" ? Partial<Extras.Date.In> : never;
	};

	// converters
	export type ValueFromType<T extends Type, S extends Setup<T> = Setup<T>> = T extends "file"
		? // TODO: figure out how to display this in options but hide it from final object value type
			FileList // | string | string[] | {name: string; url: string;} | {name: string; url:string}[]
		: T extends "checkbox"
			? S["checkbox"] extends Extras.Checkbox.In
				?
						| (undefined | unknown extends S["checkbox"]["yes"] ? true : S["checkbox"]["yes"])
						| (undefined | unknown extends S["checkbox"]["no"] ? false : S["checkbox"]["no"])
				: boolean
			: T extends "select" | "select.radio"
				? (
						Extras.Factory<S, "select" | "select.radio">["options"][number] extends infer G
							? { [K in keyof G as K extends `__${infer _internal}` ? never : K]: G[K] }
							: never
					) extends infer G
					? S["multiple"] extends true
						? G[]
						: G
					: never
				: T extends "tel"
					? string
					: string; // default/fallback data type
	export type ValueFromOptions<T extends Type, V, S extends Setup<T, V> = Setup<T, V>> = (
		true extends Check.IsUnknown<V> | Check.IsUndefined<V> | Check.IsNull<V>
			? // if value is not set then fallback to original input type value
				{ value: ValueFromType<T, S> }
			: T extends "file" | "select" | "select.radio"
				? { value: ValueFromType<T, S> } // control final recieved types, for example file type input is strictly set to FileList
				: { value: V }
	) extends infer G
		? {
				[K in keyof G]: S["required"] extends false
					? S["valueNullable"] extends false
						? G[K]
						: G[K] | undefined
					: S["hidden"] extends true
						? S["valueNullable"] extends false
							? G[K]
							: G[K] | undefined
						: G[K];
			}
		: never;
	export type SetupIn = Type | Setup | null | undefined;
	export type SetupInToSetup<S extends SetupIn> = S extends Setup<infer type, infer value>
		? ValueFromOptions<type, value, S> & Omit<S, "value">
		: S extends Type
			? ValueFromOptions<S, undefined> & Omit<Field.Setup<S>, "value"> // when basic is a field type
			: ValueFromOptions<Type, string> & Omit<Setup<Type, string>, "value">; // if caused issues change to FieldType

	// element
	export type Element<S extends Setup> = {
		focused: boolean;
		visited: boolean;
		entered: boolean;
		left: boolean;
	} & {
		[K in keyof Setup as K extends keyof typeof IGNORED_SETUP_KEYS | "select" | "checkbox"
			? never
			: K]: S[K] extends
			| Check.IsUnknown<S[K]>
			| Check.IsUndefined<S[K]>
			| Check.IsNull<S[K]>
			| Check.IsEmpty<S[K]>
			? Setup[K]
			: S[K];
	};

	// store
	export type StoreObject<S extends Setup> = {
		readonly __internal: {
			key: string;
			manual: boolean;
			preprocess?: boolean;
			noValidation?: boolean;
		};
		readonly event: {
			DOM: FIELD.DOM;
			MUTATE: FIELD.MUTATE;
			CYCLE: FIELD.CYCLE;
			RENDER: FIELD.RENDER;
			ev: undefined | Event;
		};
		// user
		value: S["value"] | undefined;
		condition: Condition;
		element: Element<S>;
		/** user defined data */
		props: S["props"];
		extras: Extras.Factory<S>;
		errors?: string[];
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
		readonly store: Store<S, O>;
		// readonly store: Omit<Store<S, O>, "set" | "setKey">; //Store<S, O>;
		// readonly render: ReturnType<typeof createElement<S, O>>;
		readonly render: {
			dom: IntegrationDom<S, O>;
			ref: IntegrationRef<S, O>;
			preact: IntegrationPreact<S, O>;
			react: IntegrationReact<S, O>;
			solid: IntegrationSolid<S, O>;
			svelte: IntegrationSvelte<S, O>;
		};
		// addons
		readonly update: Addon.FieldUpdate<S, O>;
		readonly remove: Addon.FieldRemove<S, O>;
		readonly reset: Addon.FieldReset<S, O>;
	};
}

export namespace Extras {
	export namespace File {
		export type Out<S extends Field.Setup> = {
			count: {
				upload: number;
				failed: number;
				done: number;
			};
			fallback?: { name: string; url: string }[];
			files?: {
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
		};
	}

	export namespace Select {
		export type In = {
			options?: (string | number | Record<string, unknown> | { label: string; value: string })[];
			valueKey?: string;
			labelKey?: string;
			/**
			 * incase the valueKey is not found in the option object, the dafault
			 * behvior is to find a key dynamically and store it in the option
			 * @default false
			 */
			throwOnKeyNotFound?: boolean;
			/**
			 * allows for dynamic creation of selection options by deriving the options
			 * from the selected option at runtime, useful for adding options to an existing
			 * list or creating a whole selection options dynamically.
			 */
			dynamic?: boolean;
		};

		export type Out<S extends Field.Setup> = {
			dynamic: boolean | undefined;
			valueKey: string;
			labelKey: string;
			selected: number;
			throwOnKeyNotFound: boolean;
			prev: number[];
			current: number[];
			options: ((S["select"] extends In
				? S["select"]["options"] extends (infer option)[]
					? option extends string | number
						? { label: option; value: option }
						: option
					: { label: string; value: string }
				: { label: string; value: string }) & {
				__selected: boolean;
				__key: string;
				__valueKey?: string;
				__labelKey?: string;
			})[];
		};
	}

	export namespace Checkbox {
		export type In<Y = any, N = any> = {
			yes?: Y;
			no?: N;
		};

		export type Out<S extends Field.Setup> = {
			checked: boolean;
			yes?: Exclude<S["checkbox"], undefined>["yes"];
			no?: Exclude<S["checkbox"], undefined>["no"];
		};
	}

	export namespace Tel {
		export type In = {
			/**
			 * some phone numbers may include chars like '-', by default these chars
			 * get sanitized, you can ignore some sanitization chars here to be included
			 * in the final tel value.
			 * @default undefined
			 */
			preserveChars?: string;
			international?: {
				/**
				 * international numbers prefixes, use this if your field accepts
				 * weird international prefixes like (00) or (+00). this option replaces defaults.
				 * @default ["+", "00", "+(00)"]
				 */
				prefixes?: string | string[];
				/**
				 * unify international prefixes with only + and 00 while preserving user
				 * input international prefix such as +(00), this is useful for clear user
				 * experience and UI while maintaining user data in the background.
				 * @default false
				 */
				prefixNormalization?: boolean;
				/**
				 * this option allows removes international code from the value
				 * displaying only the phone number. useful for components that display
				 * international code seprately.
				 * @default 'normal'
				 */
				displayMode?: "normal" | "no-prefix" | "keep-prefix";
			};
		};

		export type Out<S extends Field.Setup> = {
			preserveChars: string | undefined;
			international: {
				// user defined
				prefixes: string | string[] | null;
				prefixNormalization: boolean | undefined;
				displayMode: "normal" | "no-prefix" | "keep-prefix";
				//
				prefix: string | null;
				country: null | {
					name: string;
					flag: string;
					code: string;
					dial_code: string;
					dial_code_no_id: string;
					index: number;
				};
			};
			value: {
				number?: string | null;
				numberNoCode?: string | null;
				numberNoZero?: string | null;
				numberNoCodeNoZero?: string | null;
				//
				preserved?: string | null;
				preservedNoCode?: string | null;
				preservedNoZero?: string | null;
				preservedNoCodeNoZero?: string | null;
			};
		};
	}

	export namespace Date {
		interface Cell {
			key: string;
			mode: CALENDAR.MODE;
			modeName: keyof typeof CALENDAR.MODE;
			value: string;
			valueNumber: number;
			isSelected: boolean;
		}

		export interface CellDate extends Cell {
			name: string;
			shortName: string;
			isToday?: boolean;
			isOtherMonth?: boolean;
		}

		export interface CellTime extends Cell {
			is24Hour?: boolean;
		}

		export interface Header {
			value: string;
			name: string;
			shortName: string;
		}

		export interface ParsedDate {
			year: string | null;
			month: string | null;
			day: string | null;
			yearNumber: number | null;
			monthNumber: number | null;
			dayNumber: number | null;
			valid: boolean;
			formatted: string | null;
		}

		export interface ParsedTime {
			hour: string | null;
			minute: string | null;
			second: string | null;
			hourNumber: number | null;
			minuteNumber: number | null;
			secondNumber: number | null;
			period: "AM" | "PM" | null;
			valid: boolean;
			formatted: string | null;
			formatted24h: string | null;
		}

		export interface ParsedResult {
			date: ParsedDate;
			time: ParsedTime[];
			valid: boolean;
			others: string | null;
			error?: string;
		}

		export type In = {
			// mode: Mode;
			/**
			 * format of the date, use char n to denote minutes, everything else is universal standard.
			 * @option {yyyy or yy} for years
			 * @option {mm or m} for months, mm won't detect user typed single digits
			 * @option {dd or d} for days, dd won't detect user typed single digits
			 * @option {hh or h} for hours, hh won't detect user typed single digits
			 * @option {nn or n} for minutes, nn won't detect user typed single digits
			 * @option {ss or s} for seconds, ss won't detect user typed single digits
			 * @example
			 * format: "d-m-yyyy hh:nn";
			 * // note the '/', the detection allows free familiar human language.
			 * value: "meeting on 22-12/2025 at exactly 14:30"
			 * @default "d-m-yyyy h:n:s"
			 */
			format: string;
			/**
			 * separators used for dates
			 * @default ['-', '/', '.']
			 */
			dateSeparators: string | string[];
			/**
			 * separators used for time
			 * @default [':']
			 */
			timeSeparators: string | string[];
			/**
			 * separator used to split multiple dates
			 * @default |
			 */
			multipleDateSeparator: string;
			/**
			 * separator used to split multiple times for selected dates
			 * @default ,
			 */
			multipleTimeSeparator: string;
			multipleTime: boolean;
			/**
			 * locale used in date objects parsing.
			 * @default 'en-US'
			 */
			locale: string;
			yearSpan: number;
			yearView: number;
			firstDayOfWeek: number;
			timeFormat: "12h" | "24h";
			now: {
				year?: number;
				month?: number;
				day?: number;
				hour?: number;
				minute?: number;
				second?: number;
				period?: "am" | "pm";
			};
		};

		export type Out<S extends Field.Setup> = {
			// from options
			format: string;
			dateSeparators: string[];
			timeSeparators: string[];
			multipleDateSeparator: string;
			multipleTimeSeparator: string;
			multipleTime: boolean;
			locale: string;
			yearSpan: number;
			yearView: number;
			firstDayOfWeek: number;
			timeFormat: "12h" | "24h";
			now: {
				year: number;
				month: number; // 0-11
				day: number;
				hour: number;
				minute: number;
				second: number;
				period?: string | null;
			};

			// processed/generated
			selected: SelectedList;
			mode: {
				active: CALENDAR.MODE;
				activeType: CALENDAR.MODE_TYPE;
				default: CALENDAR.MODE;
				defaultType: CALENDAR.MODE_TYPE;
				apply: CALENDAR.MODE; // when to apply choices
				// names
				activeName: keyof typeof CALENDAR.MODE;
				activeTypeName: keyof typeof CALENDAR.MODE_TYPE;
				defaultName: keyof typeof CALENDAR.MODE;
				defaultTypeName: keyof typeof CALENDAR.MODE;
				applyName: keyof typeof CALENDAR.MODE; // when to apply choices
				// others
				sequence: CALENDAR.MODE[];
			};
			headers: {
				days: Header[];
				year: number;
				yearStart: number;
				yearEnd: number;
				month: number;
				monthShort: string;
				monthLong: string;
				day: number;
				dayShort: string;
				dayLong: string;
				period?: string | null;
			};
			cells: {
				YEAR?: CellDate[];
				MONTH?: CellDate[];
				DAY?: CellDate[];
				//
				HOUR?: CellTime[];
				MINUTE?: CellTime[];
				SECOND?: CellTime[];
				// PERIOD?: CellTime[];
				//
				DATE?: CellDate[]; // for sequential loops
				TIME?: CellTime[]; //
			};
		};
	}

	/**
	 * sometimes some field types require additional information beyond the
	 * the standard field "value", this offers that through value processing
	 * and places it under FieldState or State
	 */
	export type Factory<S extends Field.Setup<Field.Type>, T = S["type"]> = T extends "file"
		? File.Out<S>
		: T extends "select" | "select.radio"
			? Select.Out<S>
			: T extends "checkbox"
				? Checkbox.Out<S>
				: T extends "tel"
					? Tel.Out<S>
					: T extends "date"
						? Date.Out<S>
						: never;
}

export namespace Form {
	//
	// export type Status = "mount" | "idle" | "incomplete" | "error" | "valid" | "submit";
	export type FieldsIn = Record<string, Field.SetupIn> | undefined | null;
	export type Fields<I extends FieldsIn = FieldsIn, O extends Options = Options> = I extends Record<
		string,
		Field.SetupIn
	>
		? {
				[K in keyof I]: Field.SetupInToSetup<I[K]> extends Field.Setup
					? Field.Factory<Field.SetupInToSetup<I[K]>, O>
					: never;
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
		onMount?: (
			props: {
				readonly isServerSide: () => boolean;
				readonly form: StoreObject<F, Options<F>>;
				readonly prev: StoreObject<F, Options<F>>;
				readonly getForm: () => StoreObject<F, Options<F>>;
				readonly update: Addon.FormUpdate<F, Options<F>>;
				readonly fields: F;
			},
			listen: <Value, OriginStores extends _QSTATE.Nano.Abstract[]>(
				stores: [...OriginStores],
				cb: (...values: _QSTATE.Nano.Values<OriginStores>) => void | Promise<void | Value>,
			) => void,
		) => void | Promise<void>;
		onEffect?: (props: {
			readonly isServerSide: () => boolean;
			readonly form: StoreObject<F, Options<F>>;
			readonly prev: StoreObject<F, Options<F>>;
			readonly fields: F;
		}) => void;

		//## fields
		/**
		 * default behavior of form is to consider all fields required,
		 * use this to change that default, indvidual fields 'required'
		 * options supercedes this.
		 * @default true
		 */
		fieldsRequired?: boolean;
		/**
		 * default behavior of form is to consider all fields enabled,
		 * use this to change that default, indvidual fields 'disabled'
		 * options supercedes this.
		 * @default true
		 */
		fieldsDisabled?: boolean;
		/**
		 * default behavior of form is to start with CYCLES.IDLE,
		 * use this to change that default, indvidual fields 'initCycle'
		 * options supercedes this.
		 * @default true
		 */
		fieldsInitCycle?: FIELD.CYCLE;

		/**
		 * listen to all changes occured on any field and alter it's data if necessary,
		 * this gets called before the individual field's onChange method if any.
		 */
		fieldsOnChange?: Field.OnChange<Field.Type, any>;
		/**
		 * global per element render listener, gets called before or after field's specific
		 * onElement based on onFieldElementOrder option.
		 */
		fieldsOnRender?: Field.OnRender<Field.Type>;
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
			[K in keyof F as Extras.Factory<F[K]["setup"]> extends never ? never : K]: Extras.Factory<
				F[K]["setup"]
			>;
		};
		props: O["props"];
		incomplete: string[];
		status: FORM.STATUS;
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
		// readonly placeholders: typeof PLACEHOLDERS;
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
	}
	export type FieldCycle<S extends Field.Setup, O extends Form.Options> = Field<S, O>;
	export type FieldAddon<S extends Field.Setup, O extends Form.Options> = Field<S, O>;
	export interface FieldProcessor<S extends Field.Setup, O extends Form.Options> {
		value: any;
		el: Field.Event | undefined;
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

export namespace Addon {
	// field
	export type FieldUpdate<S extends Field.Setup, O extends Form.Options> = FieldAddonUpdate<S, O>;
	export type FieldRemove<S extends Field.Setup, O extends Form.Options> = FieldAddonRemove<S, O>;
	export type FieldReset<S extends Field.Setup, O extends Form.Options> = FieldAddonReset<S, O>;

	// form
	export type FormSubmit<F extends Form.Fields, O extends Form.Options<F>> = FormAddonSubmit<F, O>;
	export type FormUpdate<F extends Form.Fields, O extends Form.Options<F>> = FormAddonUpdate<F, O>;
	export type FormValues<F extends Form.Fields, O extends Form.Options<F>> = FormAddonValues<F, O>;
	export type FormButton<F extends Form.Fields, O extends Form.Options<F>> = FormAddonButton<F, O>;
}

//

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
		export type SelectTriggerDom = ToDom<SelectTriggerVdom>;
		export type SelectTriggerVdom = {
			name: string;
			value: any;
			onClick: (event: Event) => void;
		};
		export type SelectTrigger<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? SelectTriggerDom : SelectTriggerVdom) & Record<string, unknown>;

		// option
		export type SelectOptionDom = ToDom<SelectOptionVdom>;
		export type SelectOptionVdom = {
			value: any;
			selected: boolean;
			onClick: (event: Event) => void;
		};

		export type SelectOptionRadioDom = ToDom<SelectOptionRadioVdom>;
		export type SelectOptionRadioVdom = {
			value: any;
			selected: boolean;
			// onClick: (event: Event) => void;
		};
		export type SelectOption<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = S extends {
			type: "select";
		}
			? (A extends "dom" ? SelectOptionDom : SelectOptionVdom) & Record<string, unknown>
			: (A extends "dom" ? SelectOptionRadioDom : SelectOptionRadioVdom) & Record<string, unknown>;

		// date
		export type DateInputDom = ToDom<DateInputVdom>;
		export type DateInputVdom = {
			id: string;
			required: boolean;
			disabled: boolean;
			autoComplete: "on" | "off";
			type: string; // not linking to Field.Type to avoid issues with html.input.type
			name: string;
		};
		export type DateInput<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? DateInputDom : DateInputVdom) & Record<string, unknown>;

		// date
		export type DateEventDom = ToDom<DateEventVdom>;
		export type DateEventVdom = {
			id: string;
			name: string;
			onClick: (event: Event) => void;
		};
		export type DateEvent<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? DateEventDom : DateEventVdom) & Record<string, unknown>;

		export type DateCellDom = ToDom<DateCellVdom>;
		export type DateCellVdom = {
			id: string;
			name: string;
			onClick: (event: Event) => void;
		};
		export type DateCell<
			S extends Field.Setup,
			O extends Form.Options,
			A extends Type,
		> = (A extends "dom" ? DateCellDom : DateCellVdom) & Record<string, unknown>;

		// all
		export type AllInputDom = HTMLInputElement;
		export type AllInputVdom = PJSX.IntrinsicElements["input"];

		// factory
		export type Factory<R> = R;
	}
}

export namespace Integration {
	export type Template<S extends Field.Setup, O extends Form.Options> = {
		input: any;
		select: {
			trigger: any;
			option: any;
		};
		date: {
			input: any;
			event: any;
			cell: any;
		};
	};

	//
	export type RenderFactory<
		S extends Field.Setup,
		O extends Form.Options,
		N extends string,
		T extends Template<S, O>,
	> = (S extends { type: "select" } | { type: "select.radio" }
		? T["select"]
		: S extends { type: "date" }
			? T["date"]
			: T["input"]) & {
		__integrationFor: N;
		__integrationName: `${N}-RENDER`;
	};
}

// export namespace Plugin {
// 	export namespace Render {
// 		//
// 		export type Factory<
// 		S extends Field.Setup,
// 		O extends Form.Options,
// 		A extends Render.Attributes.Type,
// 		I,
// 	> = (
// 		basic: FunctionProps.Field<S, O>,
// 		props: FunctionProps.RenderAttributes<S, O, A>,
// 	) => {
// 		instance: I
// 	}

// 	//
// 	export type AirDatePicker<>
// 	}
// }
