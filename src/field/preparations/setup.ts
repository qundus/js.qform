import type { Field, Form } from "../../_model";
import { PLACEHOLDERS } from "../../const";

export function prepareSetup<F extends Field.FactoryIn, O extends Form.Options<any>>(
	key: string,
	inn: F,
	options?: O,
) {
	let field = {} as Partial<Field.FactoryInToSetup<F>>;
	// formulate the basic to setup object
	if (inn == null) {
		// default fallback input type
		field = {
			type: "text",
			value: null,
		} as any;
	} else if (typeof inn === "string") {
		field = {
			type: inn,
		} as any;
	} else {
		field = inn as any;
		if (field.type == null) {
			field.type = "text";
		}
	}

	// manage general and field specific options
	field.vmcm = field.vmcm ?? options?.vmcm ?? "normal";
	field.required = field.required ?? options?.allFieldsRequired;
	field.disabled = field.disabled ?? options?.allFieldsDisabled;
	field.valueNullable = field.valueNullable ?? false;
	field.preprocessValue = field.preprocessValue ?? options?.preprocessValues ?? true;
	field.validateOn = field.validateOn ?? options?.validateOn;
	field.incompleteStatus = field.incompleteStatus ?? true;
	field.multiple = field.multiple ?? false;
	field.abortProcessStateException = field.abortProcessStateException ?? false;

	// SPECIAL ASSIGNMENTS
	// label
	if (field.label == null) {
		const char = options?.flatObjectKeysChar;
		field.label = key;
		if (char != null) {
			if (key.includes(char)) {
				const replacement = options?.flatLabelJoinChar;
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
	return field as Field.Setup;
}
