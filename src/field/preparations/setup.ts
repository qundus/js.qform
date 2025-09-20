import type { Field, Form } from "../../_model";
import { PLACEHOLDERS } from "../../const";

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
	setup.valueNullable = setup.valueNullable ?? false;
	setup.preprocessValue = setup.preprocessValue ?? options?.preprocessValues ?? true;
	setup.validateOn = setup.validateOn ?? options?.validateOn;
	setup.incompleteStatus = setup.incompleteStatus ?? true;
	setup.multiple = setup.multiple ?? false;
	setup.abortProcessStateException = setup.abortProcessStateException ?? false;

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

	// vital checks
	if (typeof setup.preprocessValue !== "boolean") {
		throw new Error("form: preprocessValue of " + key + " must be boolean!");
	}
	return setup as Field.Setup;
}
