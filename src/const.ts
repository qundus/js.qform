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
	value: undefined,
	labelReplace: undefined,
	onChange: undefined,
	onElement: undefined,
	onMount: undefined,
	validate: undefined,
} as Pick<
	Field.Setup,
	//
	| "type"
	| "validate"
	| "value"
	//
	| "onMount"
	| "onChange"
	| "onElement"
	//
	| "labelReplace"
>;

export const FIELD_CYCLES = {
	init: 0,
	mount: 1,
	change: 2,
	load: 3,
	submit: 4,
} as const;
