// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { Field, InteractionProps } from "../_model";
import createProcessors from "../processors";

export default function onValueProcessInteraction<F extends Field>(props: InteractionProps<F>) {
	const { key, $next, event, $state, field } = props;
	let { value } = props;
	const el = event?.target as any;
	const manual_update = event == null;
	const preprocessValue = props.preprocessValue ?? field.preprocessValue;
	const processorProps = {
		key,
		event,
		value,
		field,
		manualUpdate: manual_update,
		getValueOf: (key: string) => $next.values[key],
		getConditionOf: (key: string) => $next.conditions[key],
	};
	const processors = createProcessors({ ...processorProps, $next, $state });
	if (field.type === "select") {
		value = !manual_update ? el?.value : value;
		if (preprocessValue) {
			value = processors.select(value);
		}
	} else if (field.type === "checkbox") {
		const checked = !manual_update ? el?.checked : true;
		value = !manual_update ? el?.value : value;

		if (preprocessValue) {
			value = processors.checkbox(checked, value);
		}
	} else if (field.type === "file") {
		value = !manual_update ? (el?.files as FileList) : value;
		if (preprocessValue) {
			value = processors.file(value);
		}
	} else if (field.type === "number" || field.type === "tel") {
		value = !manual_update ? el?.value : value;
		if (preprocessValue) {
			value = processors.number(value);
		}
	} else {
		value = !manual_update ? el?.value : value;
		// console.log("wow :: ", value);
	}

	// check empty strings
	if (value === "") {
		if (field.type !== "checkbox") {
			value = null;
		}
	}

	//////
	if (field.processValue != null) {
		value = field.processValue?.({
			...processorProps,
			value,
			$condition: $next.conditions[key],
			processors,
		});
	}
	return value;
}
