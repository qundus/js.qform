import type { Extras, Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
import { renderAttributesDateOption } from "../render/attributes/date.option";
import { type DateAttributeCells, renderAttributesDateCell } from "../render/attributes/date.cell";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateInput } from "../render/attributes/date.input";
import type { CALENDAR } from "../const";
//

export type IntegrationSolid<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"SOLID",
	{
		input: <D extends Render.Attributes.Type = "dom">(props?: {
			attrType?: D;
		}) => Render.Attributes.Input<S, O, D>;
		select: {
			trigger: <D extends Render.Attributes.Type = "dom">(props?: {
				attrType?: D;
			}) => Render.Attributes.SelectTrigger<S, O, D>;
			option: <D extends Render.Attributes.Type = "dom">(
				option: any,
				props?: { attrType?: D },
			) => Render.Attributes.SelectOption<S, O, D>;
		};
		date: {
			input: <D extends Render.Attributes.Type = "dom">(props?: {
				attrType?: D;
			}) => Render.Attributes.DateInput<S, O, D>;
			event: {
				<D extends Render.Attributes.Type = "dom">(
					event: CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Render.Attributes.DateEvent<S, O, D>;
				<D extends Render.Attributes.Type = "dom">(
					eventName: keyof typeof CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Render.Attributes.DateEvent<S, O, D>;
			};
			cell: {
				<D extends Render.Attributes.Type = "dom">(
					dateCell: Extras.Date.CellDate,
					props?: {
						attrType?: D;
					},
				): Render.Attributes.DateCell<S, O, D>;
				<D extends Render.Attributes.Type = "dom">(
					timeCell: Extras.Date.CellTime,
					props?: {
						attrType?: D;
					},
				): Render.Attributes.DateCell<S, O, D>;
				<D extends Render.Attributes.Type = "dom">(
					items: DateAttributeCells,
					props?: {
						attrType?: D;
					},
				): Render.Attributes.DateCell<S, O, D>;
			};
			option: <D extends Render.Attributes.Type = "dom">(
				option: Extras.Date.Option,
				props?: {
					attrType?: D;
				},
			) => Render.Attributes.DateCell<S, O, D>;
		};
	}
>;
export function solidIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationSolid<S, O> {
	const { key, setup, store, options } = basic;
	// check user process
	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
			trigger: (props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
			},
			option: (value, props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesSelectOption(basic, {
					attrType,
					reactive,
					optionValue: value,
				}) as any;
			},
		} as any;
	} else if (setup.type === "date") {
		result = {
			input: (props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateInput(basic, { attrType, reactive }) as any;
			},
			event: (event, props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
			},
			cell: (items, props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
			},
			option: (option, props) => {
				if (store.hooksUsed().solid == null) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().solid?.call();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
			},
		};
	} else {
		result = (props) => {
			if (store.hooksUsed().solid == null) {
				throw new Error(
					"qform: solid hook does not exist, please add it to options.storeHooks option!",
				);
			}
			const reactive = store.hooksUsed().solid?.call();
			const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
			return renderAttributesInput(basic, { attrType, reactive }) as any;
		};
	}

	result.__integrationFor = "SOLID";
	result.__integrationName = "SOLID-RENDER";
	return result;
}
