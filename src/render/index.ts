import type { Extras, Field, Form, FunctionProps, Render } from "../_model";
import { derive } from "@qundus/qstate";
import { renderAttributesInput } from "../render/attributes/input";

import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
//
import type { CALENDAR } from "../const";
import { renderAttributesDateInput } from "../render/attributes/date.input";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateCell, type DateAttributeCells } from "../render/attributes/date.cell";
import { renderAttributesDateOption } from "../render/attributes/date.option";

//
export function createRender<
	S extends Field.Setup,
	O extends Form.Options,
	D extends Render.Attributes.Type = "vdom",
>(basic: FunctionProps.Field<S, O>, _attrType: D) {
	const { setup, store } = basic;
	const attrType = _attrType ?? "vdom";
	const derived = derive(store, (reactive) => {
		if (setup.type === "select" || setup.type === "select.radio") {
			return {
				get trigger() {
					return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
				},
				get option() {
					return (option: any) => {
						return renderAttributesSelectOption(basic, {
							attrType,
							reactive,
							optionValue: option,
						}) as any;
					};
				},
			};
		} else if (setup.type === "date") {
			return {
				get input() {
					return renderAttributesDateInput(basic, { attrType, reactive }) as any;
				},
				event: (event: CALENDAR.EVENTS | keyof typeof CALENDAR.EVENTS) => {
					return renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
				},
				cell: (items: Extras.Date.CellDate | Extras.Date.CellTime | DateAttributeCells) => {
					return renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
				},
				option: (option: Extras.Date.Option) => {
					return renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
				},
			};
		}
		return renderAttributesInput(basic, { attrType, reactive }, true) as any;
	});

	// return derived as any;
	return derived;
}
