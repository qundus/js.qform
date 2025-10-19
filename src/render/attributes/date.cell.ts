// import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Form, FunctionProps, Render } from "../../_model";
import type { Extras } from "../../_model";
import { CALENDAR, FIELD } from "../../const";
import { formatDate, formatTime12h, formatTime24h } from "../helpers/date/parse";
import { nextMode } from "../helpers/date/mode";

export type DateAttributeCells = {
	YEAR?: Extras.Date.CellDate;
	MONTH?: Extras.Date.CellDate;
	DAY?: Extras.Date.CellDate;
	HOUR?: Extras.Date.CellTime;
	MINUTE?: Extras.Date.CellTime;
	SECOND?: Extras.Date.CellTime;
};
export function renderAttributesDateCell<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	_cells: Extras.Date.CellDate | Extras.Date.CellTime | DateAttributeCells,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const id = (state?.element?.label ?? setup.label) + "body.cell.id";
	const name = state.__internal.key + "body.cell";
	const attrs = {
		id,
		name,
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			const cells = "modeName" in _cells ? { [_cells.modeName]: _cells } : _cells;
			// const dayCells =
			if (cells.DAY != null && cells.DAY.isOtherMonth) {
				return;
			}
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
			//
			if (cells[next.extras.mode.applyName] == null) {
				next.extras.now.year = cells.YEAR?.valueNumber ?? next.extras.now.year;
				next.extras.now.month = cells.MONTH?.valueNumber ?? next.extras.now.month;
				next.extras.now.day = cells.DAY?.valueNumber ?? next.extras.now.day;
				next.extras.now.hour = cells.HOUR?.valueNumber ?? next.extras.now.hour;
				next.extras.now.minute = cells.MINUTE?.valueNumber ?? next.extras.now.minute;
				next.extras.now.second = cells.SECOND?.valueNumber ?? next.extras.now.second;
				next.extras.mode = nextMode(next.extras);
				next.event.DOM = FIELD.DOM.CLICK;
				next.event.MUTATE = FIELD.MUTATE.__EXTRAS;
			} else {
				// date
				const year = cells.YEAR?.value ?? `${next.extras.now.year}`;
				const month = cells.MONTH?.value ?? `${next.extras.now.month}`;
				const day = cells.DAY?.value ?? `${next.extras.now.day}`;
				const formattedDate = formatDate({ year, month, day }, next.extras.format);

				// time
				const hour = cells.HOUR?.value ?? `${next.extras.now.hour}`;
				const minute = cells.MINUTE?.value ?? `${next.extras.now.minute}`;
				const second = cells.SECOND?.value ?? `${next.extras.now.second}`;
				const formattedTime =
					next.extras.timeFormat === "12h"
						? formatTime12h({ hour, minute, second, period: next.extras.now.period as any })
						: formatTime24h({ hour, minute, second });

				//
				const value = `${formattedDate ?? ""}${formattedTime == null ? "" : " " + formattedTime}`;
				const id = formattedDate ?? "";
				const isSelected = next.value?.includes(id) ?? false;
				// if (next.element.multiple) {
				// 	let split: string[] = next.value?.split(next.extras.multipleDateSeparator) ?? [];
				// 	if (isSelected) {
				// 		split = split.filter((item) => !item.includes(id));
				// 	} else {
				// 		split.push(value);
				// 	}
				// 	value = split.join(next.extras.multipleDateSeparator);
				// }
				//
				if (!isSelected) {
					next.extras.mode = nextMode(next.extras);
				}
				// value +=
				// 	`${} ${next.extras.timeFormat === "12h" ? selected.time.formatted : selected.time.formatted24h}`.trim();
				//
				// const pointer = event.pointerType as "mouse" | "touch";
				next.event.DOM = FIELD.DOM.CLICK;
				next.event.MUTATE = FIELD.MUTATE.VALUE;
				next.event.ev = {
					value,
				};
			}
			store.set(next as any);
		},
	} as any;

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };
	options?.fieldsOnRender?.(processProps);
	setup.onRender?.(processProps);

	// mark rendered and initialize element search and mount onto picker instance
	if (state.event.RENDER === FIELD.RENDER.INIT) {
		const next = { ...store.get() };
		next.event.RENDER = FIELD.RENDER.READY;
		next.event.MUTATE = FIELD.MUTATE.__RENDER;
		store.set(next);
	}

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Render.Attributes.DateCell<S, O, A>;
}
