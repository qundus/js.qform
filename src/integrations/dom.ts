import type { Field, Form, FunctionProps, Integration, Render } from "../_model";
import { renderAttributesInput } from "../render/attributes/input";
import { renderAttributesSelectTrigger } from "../render/attributes/select.trigger";
import { renderAttributesSelectOption } from "../render/attributes/select.option";

export type IntegrationDom<
	S extends Field.Setup,
	O extends Form.Options,
> = Integration.RenderFactory<
	S,
	O,
	"DOM",
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
		date: any;
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
