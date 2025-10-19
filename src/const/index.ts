import type { Field } from "../_model";
import { default as COUNTRIES_ } from "./countries-and-codes";

export const IGNORED_SETUP_KEYS = {
	type: "text",
	validate: undefined,
	value: undefined,
	//
	onMount: undefined,
	onChange: undefined,
	onRender: undefined,
	//
	labelReplace: undefined,
	props: undefined,
	nested: undefined,
	//
	select: undefined,
	checkbox: undefined,
	tel: undefined,
	date: undefined,
} as Pick<
	Field.Setup,
	// make sure to update the keys above
	| "type"
	| "validate"
	| "value"
	// make sure to update the keys above
	| "onMount"
	| "onChange"
	| "onRender"
	// make sure to update the keys above
	| "labelReplace"
	| "props"
	| "nested"
	// extras
	| "select"
	| "checkbox"
	| "tel"
	| "date"
	// | "selections"
	// | "selectionsValueKey"
	// | "selectionsLabelKey"
>;

export namespace FORM {
	export enum STATUS {
		INIT = 0,
		IDLE = 1,
		//
		INCOMPLETE = 2,
		ERROR = 3,
		VALID = 4,
		//
		SUBMIT = 5,
	}
}

export namespace FIELD {
	export enum CYCLE {
		INIT = 0,
		IDLE = 1,
		// extra
		SUBMIT = 2,
		LOAD = 3,
		SKELETON = 4,
	}

	export enum DOM {
		INIT = "DOM.INIT",
		IDLE = "DOM.IDLE",
		//
		FOCUS = "DOM.FOCUS",
		BLUR = "DOM.BLUR",
		INPUT = "DOM.INPUT",
		CHANGE = "DOM.CHANGE",
		CLICK = "DOM.CLICK",
		CLICK_OPTION = "DOM.CLICK.OPTION",
		CLICK_DATE_EVENT = "DOM.CLICK.DATE.EVENT",
		CLICK_DATE_CELL = "DOM.CLICK.DATE.CELL",
		CLICK_DATE_OPTION = "DOM.CLICK.DATE.OPTION",
		// down
		// TOUCH = "DOM.TOUCH",
		// TOUCH_OPTION = "DOM.TOUCH.OPTION",
		// TOUCH_DATE_HEADER = "DOM.TOUCH.DATE.HEADER",
		// TOUCH_DATE_CELL = "DOM.TOUCH.DATE.CELL",
		// file
		FILE_PROGRESS = "DOM.FILE.PROGRESS",
		FILE_DONE = "DOM.FILE.DONE",
	}

	export enum MUTATE {
		INIT = "MUTATE.INIT",
		IDLE = "MUTATE.IDLE",
		//
		VALUE = "MUTATE.VALUE",
		CONDITION = "MUTATE.CONDITION",
		ELEMENT = "MUTATE.ELEMENT",
		CYCLE = "MUTATE.CYCLE",
		PROPS = "MUTATE.PROPS",
		EXTRAS = "MUTATE.EXTRAS",
		// internals
		__EXTRAS = "MUTATE.__EXTRAS",
		__RENDER = "MUTATE.__RENDER",
		__RESET = "MUTATE.__RESET",
		__ABORT_VALIDATION = "MUTATE.__ABORT_VALIDATION",
	}

	export enum RENDER {
		INIT = 0,
		READY = 1,
	}
}

export namespace MISC {
	export const PLACEHOLDERS = {
		get select() {
			return {
				value: "",
				disabled: true,
				selected: true,
			};
		},
		get selectButton() {
			return {
				value: "$$button$$",
				// selected: true,
			};
		},
	};
	export const COUNTRIES = COUNTRIES_;
}

export namespace CALENDAR {
	/**
	 * calendar modes, by default this is calculated based on the format.
	 * if a mode is not offered by the format it won't be displayed and the next
	 * logical mode is going to take place
	 */
	export enum MODE {
		YEAR = 0,
		MONTH = 1,
		DAY = 2,
		HOUR = 3,
		MINUTE = 4,
		SECOND = 5,
		// PERIOD = 6,
	}

	export enum MODE_TYPE {
		DATE = "DATE",
		TIME = "TIME",
	}

	export enum OPTIONS {
		TIME_PERIOD = 11,
	}

	export enum EVENTS {
		NAV_PREV = 11,
		NAV_NEXT = 12,
		//,
		MODE_YEARS = 21,
		MODE_MONTHS = 22,
		MODE_DAYS = 23,
		//
		// TOGGLE_TIME_PERIOD = 31, // moved to options
	}
}
