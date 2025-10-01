import type { Field, Form, FunctionProps } from "../../../_model";

export function processCheckboxValue<S extends Field.Setup<"checkbox">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { setup } = props;
	const { manualUpdate, $next } = processor;
	// const value = !manualUpdate ? el?.value : processor.value;
	// const checked = el?.checked;
	const extras = $next.extras ?? setup.checkbox ?? {};

	//
	if (manualUpdate) {
		extras.checked =
			processor.value === extras.yes ||
			processor.value === "yes" ||
			processor.value === true ||
			processor.value === "on";
	} else {
		extras.checked = extras.checked == null ? false : !extras.checked;
	}

	$next.extras = extras;
	return extras.checked ? extras.yes : extras.no;
}
