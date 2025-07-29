import type { Field, InteractionProps, Options } from "../_model";
import createProcessors from "../processors";

type Props<S extends Field, O extends Options<any>> = InteractionProps<S, O>;
export default function onFocusInteraction<S extends Field, O extends Options<any>>(
	props: Props<S, O>,
) {
	const { key, field, $form, event } = props;
	$form.conditions[key].element.state = "focus";
	$form.conditions[key].element.visited = true;
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
}
