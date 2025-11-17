// import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Form, FunctionProps, Attributes } from "../../_model";
import type { Extras } from "../../_model";
import { FIELD } from "../../const";
import { formatDate, formatTime12h, formatTime24h } from "./helpers/date/parse";
import { nextMode } from "./helpers/date/mode";

//
import DATE from "./helpers/date/DATE";
import TIME from "./helpers/date/TIME";
import YEAR from "./helpers/date/YEAR";
import MONTH from "./helpers/date/MONTH";
import DAY from "./helpers/date/DAY";
import HOUR from "./helpers/date/HOUR";
import MINUTE from "./helpers/date/MINUTE";
import SECOND from "./helpers/date/SECOND";

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
	A extends Attributes.Objects.Type,
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
			const mode = next.extras.mode;
			const multiple = next.element.multiple;
			const multipleTime = next.extras.multipleTime;
			next.element.focused = true;
			next.element.visited = true;

			// date
			const date = {
				value: "",
				update: false,
			};

			if (mode.applyDateName != null) {
				const year = cells.YEAR?.value ?? `${next.extras.YEAR.active}`;
				const month = cells.MONTH?.value ?? `${next.extras.MONTH.active}`;
				const day = cells.DAY?.value ?? `${next.extras.DAY.active}`;
				YEAR.update(cells.YEAR?.valueNumber, next.extras);
				MONTH.update(cells.MONTH?.valueNumber, next.extras);
				DAY.update(cells.DAY?.valueNumber, next.extras);
				date.value = formatDate({ year, month, day }, next.extras.format) ?? "";
				if (cells[mode.applyDateName] != null) {
					date.update = true;
				}
			}

			// time
			const time = {
				value: "",
				update: false,
			};
			if (mode.applyTimeName != null) {
				const hour = cells.HOUR?.value ?? `${next.extras.HOUR.active}`;
				const minute = cells.MINUTE?.value ?? `${next.extras.MINUTE.active}`;
				const second = cells.SECOND?.value ?? `${next.extras.SECOND.active}`;
				//
				HOUR.update(cells.HOUR?.valueNumber, next.extras);
				MINUTE.update(cells.MINUTE?.valueNumber, next.extras);
				SECOND.update(cells.SECOND?.valueNumber, next.extras);
				if (cells[mode.applyTimeName] != null) {
					time.update = true;
					time.value =
						(next.extras.timeFormat === "12h"
							? formatTime12h({
									hour,
									minute,
									second,
									period: next.extras.TIME.activePeriod as any,
								})
							: formatTime24h({ hour, minute, second })) ?? "";
				}
			}

			//
			const current = next.value;
			let split: string[] = multiple
				? (current?.split(next.extras.multipleDateSeparator) ?? [])
				: current == null
					? []
					: [current];
			let idx = split.findIndex((item) => item.includes(date.value));

			// date
			if (idx < 0) {
				// new one
				if (multiple) idx = split.push(date.value) - 1;
				else {
					idx = 0;
					split[0] = date.value;
				}

				if (!date.update) {
					next.extras.mode = nextMode(next.extras);
					next.event.DOM = FIELD.DOM.CLICK;
					next.event.MUTATE = FIELD.MUTATE.__EXTRAS;
					store.set(next as any);
					return;
				}
			} else if (date.update) {
				// exists
				split = split.filter((item) => !item.includes(date.value));
				idx = -1;
			}
			//

			// time
			if (idx >= 0) {
				next.extras.mode = nextMode(next.extras);
				let times = split[idx].replace(date.value, "").trim() as string | null;
				times = times == null || times === "" || times.length < 1 ? null : times;
				let timeSplit = multipleTime
					? (times?.split(next.extras.multipleTimeSeparator) ?? [])
					: times == null || times === ""
						? []
						: [times];
				const timeIdx = timeSplit.findIndex((item) => item.includes(time.value));
				if (timeIdx < 0) {
					timeSplit.push(time.value);
				} else if (time.update) {
					timeSplit = timeSplit.filter((item) => !item.includes(time.value));
				}
				//
				const wow = timeSplit.join(next.extras.multipleTimeSeparator);
				if (time.update) {
					split[idx] = `${date.value} ${multipleTime ? wow : (time.value ?? "")}`.trim();
				}
			}

			//
			next.event.DOM = FIELD.DOM.CLICK;
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			// console.log("date :: ", split);
			next.event.ev = {
				value:
					split.length === 0
						? null
						: multiple
							? split.join(next.extras.multipleDateSeparator)
							: split[0],
			};
			//
			store.set(next as any);
		},
	} as any;

	// console.log("element input :: ", key, " :: ", result.value);
	return attrs as Attributes.Objects.DateCell<S, O, A>;
}
