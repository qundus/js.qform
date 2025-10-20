import type { Field, Form, FunctionProps, Render } from "../../_model";
import { CALENDAR, FIELD } from "../../const";
import { goToMode } from "../helpers/date/mode";

//
import DATE from "../helpers/date/DATE";
import TIME from "../helpers/date/TIME";
import YEAR from "../helpers/date/YEAR";
import MONTH from "../helpers/date/MONTH";
import DAY from "../helpers/date/DAY";
import HOUR from "../helpers/date/HOUR";
import MINUTE from "../helpers/date/MINUTE";
import SECOND from "../helpers/date/SECOND";

export function renderAttributesDateEvent<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	_event: keyof typeof CALENDAR.EVENTS | CALENDAR.EVENTS,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const EVENT = typeof _event === "number" ? _event : CALENDAR.EVENTS[_event];
	if (EVENT === null) throw new Error("qform: unknown date event :: " + _event);
	const id = (state?.element?.label ?? setup.label) + ".event." + EVENT + ".id";
	const name = state.__internal.key + ".event." + EVENT;
	const attrs = {
		id,
		name,
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
			let update = false;
			let mode = next.extras.mode;
			const month = next.extras.MONTH.active;
			const year = next.extras.YEAR.active;
			const yearStart = next.extras.YEAR.start;
			if (EVENT === CALENDAR.EVENTS.MODE_YEARS) {
				mode = goToMode(CALENDAR.MODE.YEAR, next.extras);
			} else if (EVENT === CALENDAR.EVENTS.MODE_MONTHS) {
				mode = goToMode(CALENDAR.MODE.MONTH, next.extras);
			} else if (EVENT === CALENDAR.EVENTS.MODE_DAYS) {
				mode = goToMode(CALENDAR.MODE.DAY, next.extras);
			} else if (next.extras.mode.active === CALENDAR.MODE.DAY) {
				if (EVENT === CALENDAR.EVENTS.NAV_PREV) MONTH.events.prev(next.extras);
				else if (EVENT === CALENDAR.EVENTS.NAV_NEXT) MONTH.events.next(next.extras);
			} else if (next.extras.mode.active === CALENDAR.MODE.MONTH) {
				if (EVENT === CALENDAR.EVENTS.NAV_PREV) YEAR.events.prev(next.extras);
				else if (EVENT === CALENDAR.EVENTS.NAV_NEXT) YEAR.events.next(next.extras);
			} else if (next.extras.mode.active === CALENDAR.MODE.YEAR) {
				if (EVENT === CALENDAR.EVENTS.NAV_PREV) YEAR.events.prevView(next.extras);
				else if (EVENT === CALENDAR.EVENTS.NAV_NEXT) YEAR.events.nextView(next.extras);
			}

			//
			if (
				mode.active !== next.extras.mode.active ||
				year !== next.extras.YEAR.active ||
				yearStart !== next.extras.YEAR.start ||
				month !== next.extras.MONTH.active
			) {
				update = true;
			}

			if (!update) {
				return;
			}
			// const pointer = event.pointerType as "mouse" | "touch";
			next.extras.mode = mode;
			next.event.DOM = FIELD.DOM.CLICK_DATE_EVENT;
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
	return attrs as Render.Attributes.DateEvent<S, O, A>;
}
