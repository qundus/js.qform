import type { Field, Form } from "../../_model";
import { PLACEHOLDERS } from "../../const";
import { mergeFieldProps } from "../../methods/merge-field-props";

export function prepareSetup<F extends Field.SetupIn, S extends Field.SetupInToSetup<F>>(
	key: string,
	inn?: F,
	options?: Form.Options,
) {
	let setup = {} as Partial<S>;
	// formulate the basic to setup object
	if (inn == null) {
		// default fallback input type
		setup = {
			type: "text",
			value: null,
		} as any;
	} else if (typeof inn === "string") {
		setup = {
			type: inn,
		} as any;
	} else {
		setup = inn as any;
		if (setup.type == null) {
			setup.type = "text";
		}
	}

	// manage general and field specific options
	// field.label = field.label ?? key;
	setup.vmcm = setup.vmcm ?? options?.vmcm ?? "normal";
	setup.required = setup.required ?? options?.allFieldsRequired ?? true;
	setup.disabled = setup.disabled ?? options?.allFieldsDisabled ?? false;
	setup.hidden = setup.hidden ?? false;
	setup.valueNullable = setup.valueNullable ?? false;
	setup.preprocessValue = setup.preprocessValue ?? options?.preprocessValues ?? true;
	setup.validateOn = setup.validateOn ?? options?.validateOn;
	setup.incompleteStatus = setup.incompleteStatus ?? true;
	setup.multiple = setup.multiple ?? false;
	setup.onChangeException = setup.onChangeException ?? false;
	setup.props = mergeFieldProps(setup.props, options?.props, options?.propsMergeStrategy) as any;

	// SPECIAL ASSIGNMENTS
	// label
	if (setup.label == null) {
		setup.label = key;
		const char = options?.flatObjectKeysChar;
		const reps = [] as string[];
		if (char != null) {
			reps.push(char);
		}
		if (setup.labelReplace != null || options?.labelReplace != null) {
			const labelReplace = setup.labelReplace ?? options?.labelReplace;
			if (typeof labelReplace === "string") {
				reps.push(labelReplace);
			} else if (Array.isArray(labelReplace)) {
				reps.push(...labelReplace);
			}
		}
		for (const char of reps) {
			if (setup.label?.includes(char)) {
				const replacement = options?.flatLabelJoinChar;
				setup.label = setup.label.split(char).join(replacement);
			}
		}
	}

	// SPECIAL TYPES
	// some specfic type settings
	if (setup.type === "select") {
		//
		if (setup.select == null) {
			setup.select = {};
		}
		setup.select.valueKey = setup.select.valueKey ?? "value";
		setup.select.labelKey = setup.select.labelKey ?? "label";
		if (!setup.multiple) {
			setup.value = setup.value ?? PLACEHOLDERS.select.value;
		} else {
			if (setup.value != null) {
				if (!Array.isArray(setup.value)) {
					// @ts-ignore
					setup.value = [setup.value];
				}
			}
		}
	}
	if (setup.type === "radio") {
		if (setup.radio == null) {
			setup.radio = {};
		}
		setup.radio.valueKey = setup.radio.valueKey ?? "value";
		setup.radio.labelKey = setup.radio.labelKey ?? "label";
	}
	if (setup.type === "checkbox") {
		if (setup.checkbox == null) {
			setup.checkbox = {};
		}
		setup.checkbox.mandatory = setup.checkbox.mandatory ?? false;
	}

	// vital checks
	if (typeof setup.preprocessValue !== "boolean") {
		throw new Error("form: preprocessValue of " + key + " must be boolean!");
	}

	// finally, do props things
	return setup as Field.Setup;
}
