import type { Extras, Field, Form, FunctionProps, Integration, Attributes } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
//
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
import type { CALENDAR } from "../const";
import { type DateAttributeCells, renderAttributesDateCell } from "../render/attributes/date.cell";
import { renderAttributesDateInput } from "../render/attributes/date.input";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateOption } from "../render/attributes/date.option";
//

export type IntegrationSvelte<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"SOLID",
	{
		input: { input: Attributes.Objects.Input<S, O, "dom"> };
		select: {
			trigger: Attributes.Objects.SelectTrigger<S, O, "dom">;
			option: (option: any) => Attributes.Objects.SelectOption<S, O, "dom">;
		};
		date: {
			input: Attributes.Objects.DateInput<S, O, "dom">;
			event: {
				(event: CALENDAR.EVENTS): Attributes.Objects.DateEvent<S, O, "dom">;
				(eventName: keyof typeof CALENDAR.EVENTS): Attributes.Objects.DateEvent<S, O, "dom">;
			};
			cell: {
				(dateCell: Extras.Date.CellDate): Attributes.Objects.DateCell<S, O, "dom">;
				(timeCell: Extras.Date.CellTime): Attributes.Objects.DateCell<S, O, "dom">;
				(items: DateAttributeCells): Attributes.Objects.DateCell<S, O, "dom">;
			};
			option: (option: Extras.Date.Option) => Attributes.Objects.DateCell<S, O, "dom">;
		};
	}
>;
export function svelteIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationSvelte<S, O> {
	const { key, setup, store, options } = basic;
	// check user process

	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
			get trigger() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
			},
			get option() {
				const reactive = store.get();
				const attrType = "dom";
				return (value: any) => {
					return renderAttributesSelectOption(basic, {
						attrType,
						reactive,
						optionValue: value,
					}) as any;
				};
			},
		} as any;
	} else if (setup.type === "date") {
		result = {
			get input() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesDateInput(basic, { attrType, reactive }) as any;
			},
			get event() {
				const reactive = store.get();
				const attrType = "dom";
				return (event) => {
					return renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
				};
			},
			get cell() {
				const reactive = store.get();
				const attrType = "dom";
				return (items) => {
					return renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
				};
			},
			get option() {
				const reactive = store.get();
				const attrType = "dom";
				return (option) => {
					return renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
				};
			},
		};
	} else {
		result = {
			get input() {
				const reactive = store.get();
				const attrType = "dom";
				return renderAttributesInput(basic, { attrType, reactive }) as any;
			},
		};
	}

	result.__integrationFor = "SVELTE";
	result.__integrationName = "SVELTE-RENDER";
	return result;
}
