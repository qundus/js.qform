import type { Field, Form } from "../../_model";
import { PLACEHOLDERS } from "../../const";

export function processFieldOptions<B extends Form.Basic, O extends Form.Options<any>>(
	basic: B,
	options: O,
	key: string,
) {
	let field = {} as Partial<Form.BasicToField<B>>;
	// formulate the basic to setup object
	if (basic == null) {
		// default fallback input type
		field = {
			type: "text",
			value: null,
		} as any;
	} else if (typeof basic === "string") {
		field = {
			type: basic,
		} as any;
	} else {
		field = basic as any;
		if (field.type == null) {
			field.type = "text";
		}
	}

	// manage general and field specific options
	field.vmcm = field.vmcm ?? options.vmcm ?? "normal";
	field.required = field.required ?? options.allFieldsRequired;
	field.disabled = field.disabled ?? options.allFieldsDisabled;
	field.valueNullable = field.valueNullable ?? false;
	field.preprocessValue = field.preprocessValue ?? options?.preprocessValues ?? true;
	field.validateOn = field.validateOn ?? options.validateOn;
	field.incompleteStatus = field.incompleteStatus ?? true;
	field.multiple = field.multiple ?? false;

	// SPECIAL ASSIGNMENTS
	// label
	if (field.label == null) {
		const char = options.flatObjectKeysChar;
		field.label = key;
		if (char != null) {
			if (key.includes(char)) {
				const replacement = options.flatLabelJoinChar;
				field.label = key.split(char).join(replacement);
			}
		}
	}

	// SPECIAL TYPES
	// some specfic type settings
	if (field.type === "select") {
		if (!field.multiple) {
			field.value = field.value ?? PLACEHOLDERS.select.value;
		} else {
			if (field.value != null) {
				if (!Array.isArray(field.value)) {
					// @ts-ignore
					field.value = [field.value];
				}
			}
		}
	}

	// vital checks
	if (typeof field.preprocessValue !== "boolean") {
		throw new Error("form: preprocessValue of " + key + " must be boolean!");
	}
	return field as Field.Options;
}
