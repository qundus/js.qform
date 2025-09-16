import type { Field, Form, FunctionProps } from "../_model";
export function focusInteraction<S extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<S, O>,
	interaction: FunctionProps.Interaction<S, O>,
) {
	const { key, field } = basic;
	const { $form, event } = interaction;
	$form.conditions[key].element.state = "focus";
	$form.conditions[key].element.visited = true;
	const value = $form.values[key];

	// call user processor
	field.processCondition?.({
		event,
		value,
		field,
		$condition: $form.conditions[key],
		manualUpdate: false,
		getValueOf: (key: string) => $form.values[key],
		getConditionOf: (key: string) => $form.conditions[key],
	});
}
