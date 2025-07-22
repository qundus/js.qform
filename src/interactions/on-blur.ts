import type { Field, InteractionProps, Options } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import createProcessors from "../processors";

type Props<S extends Field, O extends Options<any, any>> = InteractionProps<S, O>;
export default function onBlurInteraction<S extends Field, O extends Options<any, any>>(
	props: Props<S, O>,
) {
	const { key, field, $next, event, $store } = props;
	$next.conditions[key].element.state = "blur";
	const value = $next.values[key];
	const processorProps = {
		key,
		field,
		event,
		value,
		manualUpdate: false,
		$condition: $next.conditions[key],
		getValueOf: (key: string) => $next.values[key],
		getConditionOf: (key: string) => $next.conditions[key],
	};
	field.processCondition?.({
		...processorProps,
		get processors() {
			return createProcessors({ ...processorProps, $next, $store });
		},
	});

	//
	if (field.incompleteStatus) {
		const value = $next.values[key];
		const incomplete = isFieldIncomplete({
			value,
			condition: $next.conditions[key],
			field,
		});
		if (incomplete) {
			$next.conditions[key].value.error = "incomplete";
		}
	}
}
