import type { Extras, Field, Form, FunctionProps } from "../../_model";
import { renderAttributesInput } from "./input";

import { renderAttributesSelectTrigger } from "./select.trigger";
import { renderAttributesSelectOption } from "./select.option";
//
import type { CALENDAR } from "../../const";
import { renderAttributesDateInput } from "./date.input";
import { renderAttributesDateEvent } from "./date.event";
import { renderAttributesDateCell, type DateAttributeCells } from "./date.cell";
import { renderAttributesDateOption } from "./date.option";

//
export function createAttributes<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<S, O>,
) {
	const { setup } = basic;
	if (setup.type === "select" || setup.type === "select.radio") {
		return {
			get trigger() {
				return renderAttributesSelectTrigger(basic, state);
			},
			get option() {
				return (option: any) => {
					return renderAttributesSelectOption(basic, state as any, option);
				};
			},
		};
	} else if (setup.type === "date") {
		return {
			get input() {
				return renderAttributesDateInput(basic, state as any);
			},
			get event() {
				return (event: CALENDAR.EVENTS | keyof typeof CALENDAR.EVENTS) => {
					return renderAttributesDateEvent(basic, state as any, event);
				};
			},
			get cell() {
				return (items: Extras.Date.CellDate | Extras.Date.CellTime | DateAttributeCells) => {
					return renderAttributesDateCell(basic, state as any, items);
				};
			},
			get option() {
				return (option: Extras.Date.Option) => {
					return renderAttributesDateOption(basic, state as any, option) as any;
				};
			},
		};
	}

	return {
		get input() {
			return renderAttributesInput(basic, state);
		},
	};
}
