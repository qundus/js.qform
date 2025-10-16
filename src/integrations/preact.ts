import type { Extras, Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
//
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";
//
import { renderAttributesDateInput } from "../render/attributes/date.input";
import {
	renderAttributesDateHeader,
	type DateHeaderElement,
} from "../render/attributes/date.header";
import { renderAttributesDateCell, type DateAttributeCells } from "../render/attributes/date.cell";

export type IntegrationPreact<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"PREACT",
	{
		input: <D extends Render.Attributes.Type = "vdom">(props?: {
			attrType?: D;
		}) => Render.Attributes.Input<S, O, D>;
		select: {
			trigger: <D extends Render.Attributes.Type = "vdom">(props?: {
				attrType?: D;
			}) => Render.Attributes.SelectTrigger<S, O, D>;
			option: <D extends Render.Attributes.Type = "vdom">(
				option: any,
				props?: { attrType?: D },
			) => Render.Attributes.SelectOption<S, O, D>;
		};
		date: {
			input: <D extends Render.Attributes.Type = "vdom">(props?: {
				attrType?: D;
			}) => Render.Attributes.DateInput<S, O, D>;
			header: <D extends Render.Attributes.Type = "vdom">(
				element: DateHeaderElement,
				props?: {
					attrType?: D;
				},
			) => Render.Attributes.DateHeader<S, O, D>;
			cell: <D extends Render.Attributes.Type = "vdom">(
				items: DateAttributeCells,
				props?: {
					attrType?: D;
				},
			) => Render.Attributes.DateCell<S, O, D>;
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
			header: (element, props) => {
				if (store.hooksUsed().preact == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.storeHooks option!",
					);
				}
				const reactive = store.hooksUsed().preact?.call();
				const attrType = props?.attrType ?? "vdom"; //as typeof props.attrType;
				return renderAttributesDateHeader(basic, { attrType, reactive }, element) as any;
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
