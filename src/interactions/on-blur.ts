import type { Field, InteractionProps, Options } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import createProcessors from "../processors";

type Props<S extends Field, O extends Options<any, any>> = InteractionProps<S, O>;
export default function onBlurInteraction<S extends Field, O extends Options<any, any>>(
	props: Props<S, O>,
) {
	const { key, field, $form, event } = props;
	$form.conditions[key].element.state = "blur";
	const value = $form.values[key];
	const processorProps = {
		key,
		field,
		event,
		value,
		manualUpdate: false,
		$condition: $form.conditions[key],
		getValueOf: (key: string) => $form.values[key],
		getConditionOf: (key: string) => $form.conditions[key],
	};
	field.processCondition?.({
		...processorProps,
		get processors() {
			return createProcessors({ ...processorProps, $form });
		},
	});

	//
	if (field.incompleteStatus) {
		const value = $form.values[key];
		const incomplete = isFieldIncomplete({
			value,
			condition: $form.conditions[key],
			field,
		});
		if (incomplete) {
			$form.conditions[key].value.error = "incomplete";
		}
	}
}
