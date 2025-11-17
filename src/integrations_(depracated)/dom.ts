import type { Extras, Field, Form, FunctionProps, Integration, Attributes } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
import { type DateAttributeCells, renderAttributesDateCell } from "../render/attributes/date.cell";
import type { CALENDAR } from "../const";
import { renderAttributesDateOption } from "../render/attributes/date.option";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateInput } from "../render/attributes/date.input";

export type IntegrationDom<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"DOM",
	{
		input: <D extends Attributes.Objects.Type = "dom">(props?: {
			attrType?: D;
		}) => Attributes.Objects.Input<S, O, D>;
		select: {
			trigger: <D extends Attributes.Objects.Type = "dom">(props?: {
				attrType?: D;
			}) => Attributes.Objects.SelectTrigger<S, O, D>;
			option: <D extends Attributes.Objects.Type = "dom">(
				option: any,
				props?: { attrType?: D },
			) => Attributes.Objects.SelectOption<S, O, D>;
		};
		date: {
			input: <D extends Attributes.Objects.Type = "dom">(props?: {
				attrType?: D;
			}) => Attributes.Objects.DateInput<S, O, D>;
			event: {
				<D extends Attributes.Objects.Type = "dom">(
					event: CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateEvent<S, O, D>;
				<D extends Attributes.Objects.Type = "dom">(
					eventName: keyof typeof CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateEvent<S, O, D>;
			};
			cell: {
				<D extends Attributes.Objects.Type = "dom">(
					dateCell: Extras.Date.CellDate,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
				<D extends Attributes.Objects.Type = "dom">(
					timeCell: Extras.Date.CellTime,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
				<D extends Attributes.Objects.Type = "dom">(
					items: DateAttributeCells,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
			};
			option: <D extends Attributes.Objects.Type = "dom">(
				option: Extras.Date.Option,
				props?: {
					attrType?: D;
				},
			) => Attributes.Objects.DateCell<S, O, D>;
		};
	}
>;
export function domIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationDom<S, O> {
	const { key, setup, store, options } = basic;
	// check user process
	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
			trigger: (props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
			},
			option: (value, props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesSelectOption(basic, {
					attrType,
					reactive,
					optionValue: value,
				}) as any;
			},
		};
	} else if (setup.type === "date") {
		result = {
			input: (props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateInput(basic, { attrType, reactive }) as any;
			},
			event: (event, props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
			},
			cell: (items, props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
			},
			option: (option, props) => {
				const reactive = store.get();
				const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
				return renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
			},
		};
	} else {
		result = (props) => {
			const reactive = store.get();
			const attrType = props?.attrType ?? "dom"; //as typeof props.attrType;
			return renderAttributesInput(basic, { attrType, reactive }) as any;
		};
	}

	result.__integrationFor = "DOM";
	result.__integrationName = "DOM-RENDER";
	return result;
}
