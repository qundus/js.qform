import type { Field, Form } from "../../_model";
import { FIELD } from "../../const";
import { mergeFieldProps } from "../../methods/merge-field-props";
import { isServerSide } from "../../methods/is-server-side";

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
	setup.required = setup.required ?? options?.fieldsRequired ?? true;
	setup.disabled = setup.disabled ?? options?.fieldsDisabled ?? false;
	setup.hidden = setup.hidden ?? false;
	setup.valueNullable = setup.valueNullable ?? false;
	setup.preprocessValue = setup.preprocessValue ?? options?.preprocessValues ?? true;
	setup.validateOn = setup.validateOn ?? options?.validateOn;
	setup.incompleteStatus = setup.incompleteStatus ?? true;
	setup.multiple = setup.multiple ?? false;
	setup.onChangeException = setup.onChangeException ?? false;
	setup.props = mergeFieldProps(setup.props, options?.props, options?.propsMergeStrategy) as any;
	setup.initCycle = setup.initCycle ?? options?.fieldsInitCycle ?? FIELD.CYCLE.IDLE;
	setup.ssr = setup.ssr ?? options?.ssr ?? isServerSide();

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
	if (setup.attrs != null || options?.attrs != null) {
		setup.attrs = {
			...options?.attrs,
			...setup.attrs,
		};
		if (setup.attrs.map != null) {
			setup.attrs.map = {
				...options?.attrs?.map,
				...setup?.attrs?.map,
			};
		}
	}

	// vital checks
	if (typeof setup.preprocessValue !== "boolean") {
		throw new Error("form: preprocessValue of " + key + " must be boolean!");
	}
	if (typeof setup.ssr !== "boolean") {
		// better to let user know their doing a mistake than handling all edge cases
		throw new Error("qform: ssr option must be a boolean!, field :: " + String(key));
	}

	// finally, do props things
	return setup as Field.Setup;
}
