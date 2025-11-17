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

export function renderAttributesDateOption<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Attributes.Objects.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	option: Extras.Date.Option,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
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
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
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

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Attributes.Objects.DateOption<S, O, A>;
}
