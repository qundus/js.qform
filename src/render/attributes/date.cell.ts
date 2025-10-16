// import { isServerSide } from "@qundus/qstate/checks";
import type { Field, Form, FunctionProps, Render } from "../../_model";
import type { Extras } from "../../_model";
import { FIELD } from "../../const";
import { formatDate, formatTime12h, formatTime24h } from "../helpers/date/parse";
import { nextMode } from "../helpers/date/mode";

export type DateAttributeCells =
	| Extras.Date.Cell
	| {
			-readonly [K in keyof typeof Extras.Date.Mode]?: Extras.Date.Cell;
	  };
export function renderAttributesDateCell<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A>,
	_cells: DateAttributeCells,
) {
	const { key, options, store, setup } = basic;
	const { attrType, reactive } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"date">>;
	const id = (state?.element?.label ?? setup.label) + "body.cell.id";
	const name = state.__internal.key + "body.cell";
	const cell = "modeName" in _cells ? { [_cells.modeName]: _cells } : _cells;
	const attrs = {
		id,
		name,
		[attrType !== "vdom" ? "onclick" : "onClick"]: function onclick(event: PointerEvent) {
			event.preventDefault();
			if (cell.DAY != null && cell.DAY.isOtherMonth) {
				return;
			}
			const next = { ...store.get() } as Field.StoreObject<Field.Setup<"date">>;
			//
			const year = cell.YEAR?.value ?? `${next.extras.now.year}`;
			const month = cell.MONTH?.value ?? `${next.extras.now.month}`;
			const day = cell.DAY?.value ?? `${next.extras.now.day}`;
			const formattedDate = formatDate({ year, month, day }, next.extras.format);

			//
			next.extras.mode = nextMode(next.extras);

			// console.log("selected :: ", formattedDate);
			//
			const value = formattedDate ?? "";
			// value +=
			// 	`${} ${next.extras.timeFormat === "12h" ? selected.time.formatted : selected.time.formatted24h}`.trim();
			//
			const pointer = event.pointerType as "mouse" | "touch";
			next.event.DOM = FIELD.DOM.CLICK;
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			next.event.ev = {
				value,
			};
			store.set(next as any);
		},
	} as any;

	// process input
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "input" };
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
