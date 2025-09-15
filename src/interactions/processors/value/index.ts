// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { processCheckboxValue } from "./checkbox";
import { processFileValue } from "./file";
import { processNumberValue } from "./number";
import { processSelectValue } from "./select";

export function processValue<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
	interaction: FunctionProps.Interaction<F, O>,
	processor: FunctionProps.Processor<F, O>,
) {
	const { key, field } = basic;
	const { event, $form } = interaction;
	const { manualUpdate } = processor;

	//
	const el = event?.target as any;
	let value = interaction.value;
	if (field.type === "select") {
		value = processSelectValue(basic, interaction, processor);
	} else if (field.type === "checkbox") {
		value = processCheckboxValue(basic, interaction, processor);
	} else if (field.type === "file") {
		value = processFileValue(basic, interaction, processor);
	} else if (field.type === "number" || field.type === "tel") {
		value = processNumberValue(basic, interaction, processor);
	} else {
		value = !manualUpdate ? el?.value : value;
	}

	// check empty strings
	if (value === "") {
		if (field.type !== "checkbox") {
			value = null;
		}
	}

	////// try to keep this as the only place to processValues from user
	if (field.processValue != null) {
		const funcs =
			typeof field.processValue === "function" ? [field.processValue] : field.processValue;
		for (const pro of funcs) {
			value = pro({
				event,
				value,
				$condition: $form.conditions[key],
				manualUpdate: manualUpdate == null ? false : manualUpdate,
				getValueOf: (key: string) => $form.values[key],
				getConditionOf: (key: string) => $form.conditions[key],
			});
		}
	}
	return value;
}
