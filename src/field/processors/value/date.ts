import { isServerSide } from "@qundus/qstate/checks";
import type { Extras, Field, Form, FunctionProps } from "../../../_model";

export function processDateValue<S extends Field.Setup<"date">, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
	processor: FunctionProps.FieldProcessor<S, O>,
) {
	// setup
	const { setup } = props;
	const { el, manualUpdate, $next } = processor;
	const _value = !manualUpdate ? el?.value : processor.value;
	const extras = ($next.extras ?? setup.date ?? {}) as unknown as Extras.DateOut<
		Field.Setup<"date">
	>;

	if (manualUpdate && !isServerSide()) {
		// if (extras.adp) {
		// 	// extras.adp.selectDate(_value);
		// 	extras.adp.$el.value = _value;
		// }
	}
	console.log("value date :: ", _value, " :: ");
	// const flat = flatpickr(extras.element);

	// const flat = flatpickr(`${setup.type}.${setup.label}`, {});
	return _value;
}
