import type { Field } from "./_model";

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
	// selections: undefined,
	// selectionsLabelKey: undefined,
	// selectionsValueKey: undefined,
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
	// select
	// | "selections"
	// | "selectionsValueKey"
	// | "selectionsLabelKey"
>;

export enum CYCLE {
	INIT = 0,
	MOUNT = 1,
	CHANGE = 2,
	LOAD = 3,
	SUBMIT = 4,
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
	TOUCH = "DOM.TOUCH",
	CLICK_OPTION = "DOM.CLICK.OPTION",
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
	// internals
	__EXTRAS = "MUTATE.__EXTRAS",
}
