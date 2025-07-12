import type { Basic, BasicToField, Field, Options } from "../_model";
import { PLACEHOLDERS } from "../const";

export default function prepareFieldSetup<B extends Basic>(props: {
	key: string;
	basic: B;
	options: Options<any>;
}) {
	const { key, basic, options } = props;
	let field = {} as Partial<BasicToField<B>>;
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
	// some specfic type settings
	if (field.type === "select") {
		field.multiple = field.multiple ?? false;
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
	// manage general and field specific options
	if (field.required == null) {
		field.required = options.allFieldsRequired;
	}
	if (field.disabled == null) {
		field.disabled = options.allFieldsDisabled;
	}
	if (field.valueNullable == null) {
		field.valueNullable = false;
	}
	if (field.preprocessValue == null) {
		field.preprocessValue = options?.preprocessValues ?? true;
	} else if (typeof field.preprocessValue !== "boolean") {
		throw new Error("form: preprocessValue of " + key + " must be boolean!");
	}
	if (field.validateOn == null) {
		field.validateOn = options.validateOn;
	}
	if (field.incompleteStatus == null) {
		field.incompleteStatus = true;
	}
	// label
	if (field.label == null) {
		const char = options.flatObjectKeysChar;
		field.label = key;
		if (key.includes(char)) {
			const replacement = options.flatLabelJoinChar;
			field.label = key.split(char).join(replacement);
		}
	}
	return field as Field;
}
