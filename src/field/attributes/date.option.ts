import type { Extras, Field, Form, FunctionProps, Attributes } from "../../_model";
import { CALENDAR, FIELD } from "../../const";

//
import DATE from "./helpers/date/DATE";
import TIME from "./helpers/date/TIME";
import YEAR from "./helpers/date/YEAR";
import MONTH from "./helpers/date/MONTH";
import DAY from "./helpers/date/DAY";
import HOUR from "./helpers/date/HOUR";
import MINUTE from "./helpers/date/MINUTE";
import SECOND from "./helpers/date/SECOND";
import { processAttrs } from "../processors/attributes";

export function renderAttributesDateOption<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<Field.Setup<"date">, O>,
	option: Extras.Date.Option,
) {
	const { key, options, store, setup } = basic;
	if (option === null) throw new Error("qform: unknown date option :: " + option);
	const id =
		(state?.element?.label ?? setup.label) +
		".option." +
		option.typeName +
		"." +
		option.value +
		".id";
	const name = state.__internal.key + ".option";
	const attrs = {
		id,
		name,
		onClick: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">, O>;
			let update = false;
			const period = next.extras.TIME.activePeriod;
			if (option.type === CALENDAR.OPTIONS.TIME_PERIOD) {
				TIME.options.switchPeriod(option, next.extras);
			}

			//
			if (period !== next.extras.TIME.activePeriod) {
				update = true;
			}

			if (!update) {
				return;
			}
			// const pointer = event.pointerType as "mouse" | "touch";
			next.event.DOM = FIELD.DOM.CLICK_DATE_OPTION;
			next.event.MUTATE = FIELD.MUTATE.__EXTRAS;
			store.set(next as any);
		},
	} as any;

	// console.log("element input :: ", key, " :: ", result.value);
	return processAttrs(basic, state as any, attrs, "option"); //attrs as Attributes.Objects.DateOption<S, O, A>;
}
