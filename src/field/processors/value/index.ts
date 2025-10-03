// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, Form, FunctionProps } from "../../../_model";
import { processCheckboxValue } from "./checkbox";
import { processFileValue } from "./file";
import { processNumberValue } from "./number";
import { processTelValue } from "./tel";
import { processDateValue } from "./date";
import { processSelectValue } from "./select";

export function processValue<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	const { setup } = props;
	const { el, manualUpdate } = processor;

	//
	let value = null as any;
	if (setup.type.startsWith("select")) {
		value = processSelectValue(props as any, processor as any);
	} else if (setup.type === "checkbox") {
		value = processCheckboxValue(props as any, processor as any);
	} else if (setup.type === "file") {
		value = processFileValue(props as any, processor as any);
	} else if (setup.type === "number") {
		value = processNumberValue(props, processor);
	} else if (setup.type === "tel") {
		value = processTelValue(props, processor);
	} else if (setup.type === "date") {
		value = processDateValue(props as any, processor as any);
	} else {
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
