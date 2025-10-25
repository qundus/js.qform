import type { Extras, Field, Form, FunctionProps, Integration, Render } from "../_model";
//
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
import type { CALENDAR } from "../const";
import { renderAttributesDateInput } from "../render/attributes/date.input";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateCell, type DateAttributeCells } from "../render/attributes/date.cell";
import { renderAttributesDateOption } from "../render/attributes/date.option";
//

export type IntegrationRef<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"REF",
	{
		input: (ref: any) => void;
		select: {
			trigger: (ref: any) => void;
			option: (ref: any, option: any) => void;
		};
		date: {
			input: (ref: any) => void;
			event: {
				(ref: any, event: CALENDAR.EVENTS): void;
				(ref: any, eventName: keyof typeof CALENDAR.EVENTS): void;
			};
			cell: {
				(ref: any, dateCell: Extras.Date.CellDate): void;
				(ref: any, timeCell: Extras.Date.CellTime): void;
				(ref: any, items: DateAttributeCells): void;
			};
			option: (ref: any, option: Extras.Date.Option) => void;
		};
	}
>;
export function refIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationRef<S, O> {
	const { key, setup, store } = basic;
	// check user process
	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
			trigger: (ref) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
			option: (ref, value) => {
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesSelectOption(basic, {
					attrType,
					reactive,
					optionValue: value,
				}) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
		} as any;
	} else if (setup.type === "date") {
		result = {
			input: (ref) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesDateInput(basic, { attrType, reactive }) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
			event: (ref, event) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
			cell: (ref, items) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
			option: (ref, option) => {
				if (ref == null || ref.name === key) {
					return;
				}
				const reactive = store.get();
				const attrType = "dom";
				const attrs = renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
				for (const k in attrs) {
					ref[k] = attrs[k];
				}
			},
		};
	} else {
		result = (ref) => {
			if (ref == null || ref.name === key) {
				return;
			}
			const reactive = store.get();
			const attrType = "dom";
			const attrs = renderAttributesInput(basic, { attrType, reactive }) as any;
			for (const k in attrs) {
				ref[k] = attrs[k];
			}
		};
	}

	result.__integrationFor = "REF";
	result.__integrationName = "REF-RENDER";
	return result;
}
