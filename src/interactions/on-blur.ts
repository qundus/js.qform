import type * as _MODEL from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import createProcessors from "../processors";

type Props<S extends _MODEL.Field> = _MODEL.InteractionProps<S>;
export default function onBlurInteraction<S extends _MODEL.Field>(props: Props<S>) {
	const { key, field, $next, event, $state } = props;
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
			return createProcessors({ ...processorProps, $next, $state });
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
