import type { ElementProps, Field, FieldState } from "../_model";

// TODO: atom state may become inconsistent with onchange function
// find another way to do it!
export default function prepareFieldState<F extends Field>(props: ElementProps<F>) {
	const { key, field, $state, options } = props;
	const derived = $state.derive((state) => {
		const value = {
			value: state.values?.[key],
			condition: state.conditions?.[key],
			errors: state.errors?.[key],
			extras: state.extras?.[key], //as FieldExtras<F["type"]>,
		} as FieldState<F>["value"];
		if (field.onChange != null && typeof field.onChange === "function") {
			field.onChange({
				$value: value,
				state,
			});
			// if (next != null && typeof next === "object") {
			// 	// @ts-ignore
			// 	value = next;
			// }
		}
		// console.log("form: condition of ", key, " :: ", JSON.stringify(value.condition));
		return value;
	});

	return {
		derived,
	};
}
