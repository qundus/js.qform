import type { Field, Form, FunctionProps, Render } from "../../_model";
import { CALENDAR, FIELD } from "../../const";
import { goToMode } from "../helpers/date/mode";

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
			let nextMode = next.extras.mode;
			let nextMonth = next.extras.now.month;
			let nextYear = next.extras.now.year;
			let nextYearView = next.extras.yearView;
			if (EVENT === CALENDAR.EVENTS.MODE_YEARS) {
				nextMode = goToMode(CALENDAR.MODE.YEAR, next.extras);
			} else if (EVENT === CALENDAR.EVENTS.MODE_MONTHS) {
				nextMode = goToMode(CALENDAR.MODE.MONTH, next.extras);
			} else if (EVENT === CALENDAR.EVENTS.MODE_DAYS) {
				nextMode = goToMode(CALENDAR.MODE.DAY, next.extras);
			} else if (next.extras.mode.active === CALENDAR.MODE.DAY) {
				nextMonth =
					EVENT === CALENDAR.EVENTS.NAV_PREV
						? nextMonth - 1
						: EVENT === CALENDAR.EVENTS.NAV_NEXT
							? nextMonth + 1
							: nextMonth;
				nextMonth = nextMonth < 1 || nextMonth > 12 ? next.extras.now.month : nextMonth;
			} else if (next.extras.mode.active === CALENDAR.MODE.MONTH) {
				nextYear =
					EVENT === CALENDAR.EVENTS.NAV_PREV
						? nextYear - 1
						: EVENT === CALENDAR.EVENTS.NAV_NEXT
							? nextYear + 1
							: nextYear;
			} else if (next.extras.mode.active === CALENDAR.MODE.YEAR) {
				nextYearView =
					EVENT === CALENDAR.EVENTS.NAV_PREV
						? nextYearView - next.extras.yearSpan
						: EVENT === CALENDAR.EVENTS.NAV_NEXT
							? nextYearView + next.extras.yearSpan
							: nextYearView;
			}

			//
			if (
				nextMode.active !== next.extras.mode.active ||
				nextMonth !== next.extras.now.month ||
				nextYear !== next.extras.now.year ||
				nextYearView !== next.extras.yearView
			) {
				update = true;
			}

			if (!update) {
				return;
			}
			// const pointer = event.pointerType as "mouse" | "touch";
			next.extras.mode = nextMode;
			next.extras.now.month = nextMonth;
			next.extras.now.year = nextYear;
			next.extras.yearView = nextYearView;
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
