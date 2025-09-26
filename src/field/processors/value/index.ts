// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { processCheckboxValue } from "./checkbox";
import { processFileValue } from "./file";
import { processNumberValue } from "./number";
import { processSelectValue } from "./select";

export function processValue<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	const { setup } = props;
	const { event, manualUpdate } = processor;

	//
	let value = processor.value;
	if (setup.type === "select") {
		value = processSelectValue(props as any, processor as any);
	} else if (setup.type === "checkbox") {
		value = processCheckboxValue(props, processor);
	} else if (setup.type === "file") {
		value = processFileValue(props as any, processor as any);
	} else if (setup.type === "number") {
		value = processNumberValue(props, processor);
	} else {
		const el = event?.target as any;
		value = !manualUpdate ? el?.value : value;
	}

	// check empty strings
	if (value === "") {
		if (setup.type !== "checkbox") {
			value = null;
		}
	}

	return value;
}
