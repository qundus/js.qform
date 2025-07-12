import type { Field, InteractionProps } from "../_model";
import createProcessors from "../processors";

type Props<S extends Field> = InteractionProps<S>;
export default function onFocusInteraction<S extends Field>(props: Props<S>) {
	const { key, field, $next, event, $state } = props;
	$next.conditions[key].element.state = "focus";
	$next.conditions[key].element.visited = true;
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
}
