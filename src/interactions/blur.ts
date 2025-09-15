import type { Field, Form, FunctionProps } from "../_model";
import { isFieldIncomplete } from "../field/checks/is-field-incomplete";

export function blurInteraction<S extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<S, O>,
	interaction: FunctionProps.Interaction<S, O>,
) {
	const { key, field } = basic;
	const { $form, event } = interaction;
	$form.conditions[key].element.state = "blur";
	const value = $form.values[key];

	// call user processor if any
	field.processCondition?.({
		event,
		value,
		$condition: $form.conditions[key],
		manualUpdate: false,
		getValueOf: (key: string) => $form.values[key],
		getConditionOf: (key: string) => $form.conditions[key],
	});

	//
	if (field.incompleteStatus) {
		const value = $form.values[key];
		const incomplete = isFieldIncomplete(field, $form.conditions[key], value);
		if (incomplete) {
			$form.conditions[key].value.error = "incomplete";
		}
	}
}
