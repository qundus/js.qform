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

export const FIELD_CYCLES = {
	init: 0,
	mount: 1,
	change: 2,
	load: 3,
	submit: 4,
} as const;
