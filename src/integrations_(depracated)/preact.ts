import type { Extras, Field, Form, FunctionProps, Integration, Attributes } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
//
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
//
import type { CALENDAR } from "../const";
import { renderAttributesDateInput } from "../render/attributes/date.input";
import { renderAttributesDateEvent } from "../render/attributes/date.event";
import { renderAttributesDateCell, type DateAttributeCells } from "../render/attributes/date.cell";
import { renderAttributesDateOption } from "../render/attributes/date.option";

export type IntegrationPreact<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"PREACT",
	{
		input: <D extends Attributes.Objects.Type = "vdom">(props?: {
			attrType?: D;
		}) => Attributes.Objects.Input<S, O, D>;
		select: {
			trigger: <D extends Attributes.Objects.Type = "vdom">(props?: {
				attrType?: D;
			}) => Attributes.Objects.SelectTrigger<S, O, D>;
			option: <D extends Attributes.Objects.Type = "vdom">(
				option: any,
				props?: { attrType?: D },
			) => Attributes.Objects.SelectOption<S, O, D>;
		};
		date: {
			input: <D extends Attributes.Objects.Type = "vdom">(props?: {
				attrType?: D;
			}) => Attributes.Objects.DateInput<S, O, D>;
			event: {
				<D extends Attributes.Objects.Type = "vdom">(
					event: CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateEvent<S, O, D>;
				<D extends Attributes.Objects.Type = "vdom">(
					eventName: keyof typeof CALENDAR.EVENTS,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateEvent<S, O, D>;
			};
			cell: {
				<D extends Attributes.Objects.Type = "vdom">(
					dateCell: Extras.Date.CellDate,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
				<D extends Attributes.Objects.Type = "vdom">(
					timeCell: Extras.Date.CellTime,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
				<D extends Attributes.Objects.Type = "vdom">(
					items: DateAttributeCells,
					props?: {
						attrType?: D;
					},
				): Attributes.Objects.DateCell<S, O, D>;
			};
			option: <D extends Attributes.Objects.Type = "vdom">(
				option: Extras.Date.Option,
				props?: {
					attrType?: D;
				},
			) => Attributes.Objects.DateCell<S, O, D>;
		};
	}
>;

export function preactIntegration<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
): IntegrationPreact<S, O> {
	const { key, setup, store, options } = basic;
	let result = undefined as any;
	if (setup.type === "select" || setup.type === "select.radio") {
		result = {
			trigger: (props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesSelectTrigger(basic, { attrType, reactive }) as any;
			},
			option: (value, props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
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
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesDateInput(basic, { attrType, reactive }) as any;
			},
			event: (event, props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesDateEvent(basic, { attrType, reactive }, event) as any;
			},
			cell: (items, props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesDateCell(basic, { attrType, reactive }, items) as any;
			},
			option: (option, props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesDateOption(basic, { attrType, reactive }, option) as any;
			},
		};
	} else {
		result = (props) => {
			if (store.hooksUsed().preact == null) {
				throw new Error(
					"qform: preact hook does not exist, please add it to options.storeHooks option!",
				);
			}
			const reactive = store.hooksUsed().preact?.call();
			const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
			return renderAttributesInput(basic, { attrType, reactive }) as any;
		};
	}

	result.__integrationFor = "PREACT";
	result.__integrationName = "PREACT-RENDER";
	return result;
}
